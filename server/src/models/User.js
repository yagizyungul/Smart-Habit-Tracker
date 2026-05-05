const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    avatarEmoji: {
      type: String,
      default: '🌱',
      maxlength: 8,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    accentColor: {
      type: String,
      default: '#67C090',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    themeMode: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    notificationPrefs: {
      emailReminders: { type: Boolean, default: true },
      browserPush:    { type: Boolean, default: false },
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    friendRequests: [{
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
