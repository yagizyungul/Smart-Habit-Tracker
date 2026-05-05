const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      maxlength: 200,
      default: '',
    },
    photo: {
      type: String,
      maxlength: 500000,
      default: '',
    },
  },
  { timestamps: true }
);

// Aynı habit için aynı tarihte çift check-in engeli
checkinSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Checkin', checkinSchema);
