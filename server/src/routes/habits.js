const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET /api/habits — kullanıcının aktif alışkanlıkları
router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    next(err);
  }
});

// GET /api/habits/:id
router.get('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

// POST /api/habits
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Başlık 1-100 karakter olmalı'),
    body('frequency').isIn(['daily', 'weekly', 'custom']).withMessage('Geçersiz sıklık'),
    body('description').optional().isLength({ max: 300 }).withMessage('Açıklama max 300 karakter'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Geçerli hex renk kodu girin'),
    body('reminderTime')
      .optional({ nullable: true })
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('Hatırlatıcı saati HH:MM formatında olmalı'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, frequency, targetDays, color, icon, reminderTime } = req.body;

      const habit = await Habit.create({
        userId: req.user.id,
        title,
        description,
        frequency,
        targetDays: targetDays ?? [0, 1, 2, 3, 4, 5, 6],
        color,
        icon,
        reminderTime,
      });

      res.status(201).json(habit);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/habits/:id
router.put('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    const allowedFields = ['title', 'description', 'frequency', 'targetDays', 'color', 'icon', 'reminderTime'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) habit[field] = req.body[field];
    });

    await habit.save();
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id — soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    habit.isActive = false;
    await habit.save();

    res.json({ message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
