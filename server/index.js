require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const habitRoutes = require('./src/routes/habits');
const checkinRoutes = require('./src/routes/checkins');
const analyticsRoutes = require('./src/routes/analytics');
const aiRoutes = require('./src/routes/ai');
const gamificationRoutes = require('./src/routes/gamification');
const userRoutes = require('./src/routes/users');
const socialRoutes = require('./src/routes/social');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { loginLimiter, generalLimiter } = require('./src/middleware/rateLimiter');
const { startReminderScheduler } = require('./src/services/emailReminder');

const app = express();

const parseOrigins = (value) =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

// CORS: local dev + production Vercel URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://client-yagiz-yunuls-projects.vercel.app',
  'https://streakly-smart-habit-tracker-app.vercel.app',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Vercel preview ve branch deployment'ları için dinamik kontrol
  if (origin.endsWith('.vercel.app') && (origin.includes('streakly') || origin.includes('yagiz-yunuls'))) {
    return true;
  }
  const extraOrigins = [...parseOrigins(process.env.CLIENT_URL), ...parseOrigins(process.env.CLIENT_URLS)];
  return extraOrigins.includes(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked origin: ${origin}`);
        callback(new Error(`CORS policy: ${origin} izin listesinde yok`));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '600kb' }));
app.use(generalLimiter);

// Routes — loginLimiter sadece auth route'unda tanımlı
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/social', socialRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(notFound);
app.use(errorHandler);

// MongoDB bağlantısı ve server başlatma
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı');
    app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`));
    startReminderScheduler();
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });

module.exports = app;
