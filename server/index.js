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
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { loginLimiter, generalLimiter } = require('./src/middleware/rateLimiter');
const { startReminderScheduler } = require('./src/services/emailReminder');

const app = express();

// CORS — Ege'nin Vite dev server'ı + production Vercel URL'si
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS policy: bu origin izin listesinde yok'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(generalLimiter);

// Routes — loginLimiter sadece auth route'unda tanımlı
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

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
