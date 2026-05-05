const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const safeUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  avatarEmoji: u.avatarEmoji,
  bio: u.bio,
  accentColor: u.accentColor,
  themeMode: u.themeMode,
  notificationPrefs: u.notificationPrefs,
  createdAt: u.createdAt,
});

// GET /api/users/me — profil ayarlarıyla birlikte
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — profil/ayarları güncelle
router.patch(
  '/me',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('avatarEmoji').optional().isLength({ max: 8 }),
    body('bio').optional().isLength({ max: 200 }),
    body('accentColor').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    body('themeMode').optional().isIn(['dark', 'light']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const allowed = ['name', 'avatarEmoji', 'bio', 'accentColor', 'themeMode', 'notificationPrefs'];
      const updates = {};
      for (const k of allowed) {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      }

      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
      if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      res.json(safeUser(user));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/me/password — şifre değiştir
router.patch(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Mevcut şifre gerekli'),
    body('newPassword').isLength({ min: 8 }).withMessage('Yeni şifre en az 8 karakter olmalı'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const user = await User.findById(req.user.id).select('+password');
      if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

      const ok = await user.comparePassword(req.body.currentPassword);
      if (!ok) return res.status(401).json({ message: 'Mevcut şifre yanlış' });

      user.password = req.body.newPassword;
      await user.save();
      res.json({ message: 'Şifre başarıyla güncellendi' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
