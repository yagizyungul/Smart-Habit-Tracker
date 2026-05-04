const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const protect = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter olmalı'),
    body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta girin'),
    body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı' });
      }

      const user = await User.create({ name, email, password });
      const token = signToken(user._id);

      res.status(201).json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta girin'),
    body('password').notEmpty().withMessage('Şifre gerekli'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
      }

      const token = signToken(user._id);

      res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json({ _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
