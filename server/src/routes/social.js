const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const protect = require('../middleware/auth');
const { calcStreak } = require('../utils/streak');

const router = express.Router();
router.use(protect);

const publicProfile = (u) => ({
  _id: u._id,
  name: u.name,
  avatarEmoji: u.avatarEmoji,
  bio: u.bio,
});

// GET /api/social/search?q=...
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return res.json([]);

    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [{ name: re }, { email: re }],
    }).limit(8);

    res.json(users.map(publicProfile));
  } catch (err) {
    next(err);
  }
});

// POST /api/social/request — arkadaşlık isteği gönder
router.post(
  '/request',
  [body('userId').isMongoId()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const targetId = req.body.userId;
      if (targetId === req.user.id) {
        return res.status(400).json({ message: 'Kendine istek gönderemezsin' });
      }

      const me = await User.findById(req.user.id);
      const target = await User.findById(targetId);
      if (!target) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

      if (me.friends.some((f) => f.toString() === targetId)) {
        return res.status(409).json({ message: 'Zaten arkadaşsınız' });
      }
      const alreadyPending = target.friendRequests.some(
        (r) => r.from && r.from.toString() === req.user.id
      );
      if (alreadyPending) {
        return res.status(409).json({ message: 'İstek zaten gönderilmiş' });
      }

      target.friendRequests.push({ from: req.user.id });
      await target.save();
      res.json({ message: 'İstek gönderildi' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/social/requests — gelen istekler
router.get('/requests', async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).populate('friendRequests.from');
    res.json(
      me.friendRequests
        .filter((r) => r.from)
        .map((r) => ({ ...publicProfile(r.from), requestedAt: r.createdAt }))
    );
  } catch (err) {
    next(err);
  }
});

// POST /api/social/accept — arkadaşlık isteğini kabul et
router.post(
  '/accept',
  [body('userId').isMongoId()],
  async (req, res, next) => {
    try {
      const me = await User.findById(req.user.id);
      const other = await User.findById(req.body.userId);
      if (!other) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

      const idx = me.friendRequests.findIndex(
        (r) => r.from && r.from.toString() === req.body.userId
      );
      if (idx === -1) return res.status(404).json({ message: 'İstek bulunamadı' });

      me.friendRequests.splice(idx, 1);
      if (!me.friends.some((f) => f.toString() === req.body.userId)) {
        me.friends.push(other._id);
      }
      if (!other.friends.some((f) => f.toString() === req.user.id)) {
        other.friends.push(me._id);
      }
      await me.save();
      await other.save();

      res.json({ message: 'Arkadaş eklendi' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/social/reject — isteği reddet
router.post(
  '/reject',
  [body('userId').isMongoId()],
  async (req, res, next) => {
    try {
      const me = await User.findById(req.user.id);
      me.friendRequests = me.friendRequests.filter(
        (r) => !(r.from && r.from.toString() === req.body.userId)
      );
      await me.save();
      res.json({ message: 'İstek reddedildi' });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/social/friend/:id — arkadaşı kaldır
router.delete('/friend/:id', async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id);
    const other = await User.findById(req.params.id);
    if (!other) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    me.friends = me.friends.filter((f) => f.toString() !== req.params.id);
    other.friends = other.friends.filter((f) => f.toString() !== req.user.id);
    await me.save();
    await other.save();
    res.json({ message: 'Arkadaş kaldırıldı' });
  } catch (err) {
    next(err);
  }
});

// GET /api/social/leaderboard — kendin + arkadaşlar streak sıralaması
router.get('/leaderboard', async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id);
    const ids = [me._id, ...me.friends];

    const rows = await Promise.all(
      ids.map(async (uid) => {
        const u = await User.findById(uid);
        if (!u) return null;
        const habits = await Habit.find({ userId: uid, isActive: true });
        const checkins = await Checkin.find({ userId: uid, completed: true });
        let bestStreak = 0;
        for (const h of habits) {
          const dates = checkins
            .filter((c) => c.habitId.toString() === h._id.toString())
            .map((c) => c.date);
          const { currentStreak } = calcStreak(dates, h.frequency, h.targetDays);
          bestStreak = Math.max(bestStreak, currentStreak);
        }
        return {
          _id: u._id,
          name: u.name,
          avatarEmoji: u.avatarEmoji,
          totalCheckins: checkins.length,
          bestStreak,
          isMe: uid.toString() === req.user.id,
        };
      })
    );

    const list = rows.filter(Boolean).sort((a, b) => {
      if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
      return b.totalCheckins - a.totalCheckins;
    });

    res.json(list);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
