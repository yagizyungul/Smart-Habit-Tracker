const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      required: true,
    },
    targetDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days) => days.every((d) => d >= 0 && d <= 6),
        message: 'targetDays 0-6 arasında olmalı',
      },
    },
    color: {
      type: String,
      default: '#7F77DD',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    icon: {
      type: String,
      default: 'check',
    },
    reminderTime: {
      type: String,
      default: null,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
