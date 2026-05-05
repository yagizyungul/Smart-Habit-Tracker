const express = require('express');
const { body, validationResult } = require('express-validator');
const Checkin = require('../models/Checkin');
const Habit = require('../models/Habit');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// POST /api/checkins
router.post(
  '/',
  [
    body('habitId').isMongoId().withMessage('Geçersiz habitId'),
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Tarih YYYY-MM-DD formatında olmalı'),
    body('note').optional().isLength({ max: 200 }).withMessage('Not max 200 karakter'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { habitId, date, note, photo } = req.body;

      // Habit kullanıcıya ait mi kontrol et
      const habit = await Habit.findOne({ _id: habitId, userId: req.user.id, isActive: true });
      if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

      const checkin = await Checkin.create({
        habitId,
        userId: req.user.id,
        date,
        note: note || '',
        photo: photo || '',
        completed: true,
      });

      res.status(201).json(checkin);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Bu habit için bu tarihte zaten check-in var' });
      }
      next(err);
    }
  }
);
// POST /api/checkins/focus — Pomodoro/Odak seansı bittiğinde
router.post('/focus', async (req, res, next) => {
  try {
    const { habitId, date, focusMinutes } = req.body;
    if (!habitId || !date || !focusMinutes) {
      return res.status(400).json({ message: 'Eksik parametre' });
    }

    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id, isActive: true });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    // Gün için check-in var mı?
    let checkin = await Checkin.findOne({ habitId, date, userId: req.user.id });

    if (checkin) {
      // Varsa dakikayı ekle
      checkin.focusMinutes = (checkin.focusMinutes || 0) + focusMinutes;
      await checkin.save();
    } else {
      // Yoksa yeni oluştur
      checkin = await Checkin.create({
        habitId,
        userId: req.user.id,
        date,
        completed: true,
        focusMinutes,
      });
    }

    res.json(checkin);
  } catch (err) {
    next(err);
  }
});

// GET /api/checkins/today
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const checkins = await Checkin.find({ userId: req.user.id, date: today, completed: true });
    res.json(checkins);
  } catch (err) {
    next(err);
  }
});

// GET /api/checkins/habit/:habitId
router.get('/habit/:habitId', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d.toISOString().split('T')[0];
    })();

    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
      completed: true,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json(checkins.map((c) => c.date));
  } catch (err) {
    next(err);
  }
});

// GET /api/checkins/journal/:habitId — fotoğraf/notları içeren timeline
router.get('/journal/:habitId', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
      completed: true,
    }).sort({ date: -1 }).limit(60);

    res.json(
      checkins.map((c) => ({
        _id: c._id,
        date: c.date,
        note: c.note,
        photo: c.photo,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/checkins/:id — not/fotoğraf güncelle
router.patch('/:id', async (req, res, next) => {
  try {
    const checkin = await Checkin.findOne({ _id: req.params.id, userId: req.user.id });
    if (!checkin) return res.status(404).json({ message: 'Check-in bulunamadı' });

    if (req.body.note !== undefined) checkin.note = req.body.note;
    if (req.body.photo !== undefined) checkin.photo = req.body.photo;

    await checkin.save();
    res.json(checkin);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/checkins/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const checkin = await Checkin.findOne({ _id: req.params.id, userId: req.user.id });
    if (!checkin) return res.status(404).json({ message: 'Check-in bulunamadı' });

    await checkin.deleteOne();
    res.json({ message: 'Checkin removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
