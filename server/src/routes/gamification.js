const express = require('express');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const protect = require('../middleware/auth');
const { calcStreak } = require('../utils/streak');

const router = express.Router();
router.use(protect);

const XP_PER_CHECKIN = 10;
const XP_PER_STREAK_DAY = 5;

// Seviye eşikleri (toplam XP cinsinden)
const LEVELS = [
  { level: 1,  threshold: 0,    title: 'Başlangıç Merakı' },
  { level: 2,  threshold: 100,  title: 'İlk Adımlar' },
  { level: 3,  threshold: 250,  title: 'Düzen Arayan' },
  { level: 4,  threshold: 500,  title: 'Seri Avcısı' },
  { level: 5,  threshold: 800,  title: 'Disiplin Çırağı' },
  { level: 6,  threshold: 1200, title: 'Odak Ustası' },
  { level: 7,  threshold: 1700, title: 'Ritim Tutkunu' },
  { level: 8,  threshold: 2300, title: 'Alışkanlık Mimarı' },
  { level: 9,  threshold: 3000, title: 'Zihin Sporcusu' },
  { level: 10, threshold: 4000, title: 'Alışkanlık Ustası' },
];

function levelFromXp(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const nextThreshold = next?.threshold ?? current.threshold;
  const span = nextThreshold - current.threshold;
  const inLevelXp = xp - current.threshold;
  const progress = next ? Math.min(100, Math.round((inLevelXp / span) * 100)) : 100;
  return {
    level: current.level,
    title: current.title,
    nextTitle: next?.title ?? null,
    currentThreshold: current.threshold,
    nextThreshold,
    progress,
    inLevelXp,
    toNext: next ? Math.max(0, nextThreshold - xp) : 0,
  };
}

function buildBadges({ totalCheckins, bestStreakOverall, perfectDays, distinctHabits }) {
  return [
    { key: 'first_step',   icon: '🌱', title: 'İlk Adım',         desc: 'İlk check-in yapıldı',          unlocked: totalCheckins >= 1 },
    { key: 'consistent',   icon: '📅', title: 'Düzenli',           desc: '10 check-in tamamlandı',         unlocked: totalCheckins >= 10 },
    { key: 'devoted',      icon: '💎', title: 'Adanmış',           desc: '50 check-in tamamlandı',         unlocked: totalCheckins >= 50 },
    { key: 'centurion',    icon: '🏆', title: 'Yüzbaşı',           desc: '100 check-in tamamlandı',        unlocked: totalCheckins >= 100 },
    { key: 'streak_7',     icon: '🔥', title: '7 Gün Serisi',      desc: 'En az 7 gün üst üste',           unlocked: bestStreakOverall >= 7 },
    { key: 'streak_30',    icon: '💠', title: '30 Gün Mükemmel',   desc: 'En az 30 gün üst üste',          unlocked: bestStreakOverall >= 30 },
    { key: 'perfect_5',    icon: '⭐', title: 'Mükemmel Hafta',    desc: '5 mükemmel gün (son 30)',        unlocked: perfectDays >= 5 },
    { key: 'perfect_15',   icon: '🌟', title: 'Mükemmellik Avı',   desc: '15 mükemmel gün (son 30)',       unlocked: perfectDays >= 15 },
    { key: 'collector',    icon: '🎯', title: 'Koleksiyoncu',      desc: '5 farklı alışkanlık',            unlocked: distinctHabits >= 5 },
  ];
}

// GET /api/gamification/profile
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habits = await Habit.find({ userId });
    const checkins = await Checkin.find({ userId, completed: true });

    const totalCheckins = checkins.length;

    let bestStreakOverall = 0;
    let totalStreakDays = 0;
    for (const habit of habits) {
      const dates = checkins
        .filter((c) => c.habitId.toString() === habit._id.toString())
        .map((c) => c.date);
      const { currentStreak, bestStreak } = calcStreak(dates, habit.frequency, habit.targetDays);
      bestStreakOverall = Math.max(bestStreakOverall, bestStreak);
      totalStreakDays += currentStreak;
    }

    // Mükemmel günler — son 30 gün
    const today = new Date().toISOString().split('T')[0];
    const start30 = new Date();
    start30.setDate(start30.getDate() - 29);
    const start30Str = start30.toISOString().split('T')[0];
    const recent = checkins.filter((c) => c.date >= start30Str && c.date <= today);
    const dateSet = new Set(recent.map((c) => `${c.habitId}_${c.date}`));
    const activeHabits = habits.filter((h) => h.isActive);
    let perfectDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      let exp = 0;
      let comp = 0;
      for (const h of activeHabits) {
        const isTarget = h.frequency === 'daily' || h.targetDays.includes(d.getDay());
        if (!isTarget) continue;
        exp++;
        if (dateSet.has(`${h._id}_${ds}`)) comp++;
      }
      if (exp > 0 && exp === comp) perfectDays++;
    }

    const xp = totalCheckins * XP_PER_CHECKIN + totalStreakDays * XP_PER_STREAK_DAY;
    const levelInfo = levelFromXp(xp);
    const distinctHabits = activeHabits.length;
    const badges = buildBadges({ totalCheckins, bestStreakOverall, perfectDays, distinctHabits });

    res.json({
      xp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      nextLevelTitle: levelInfo.nextTitle,
      progress: levelInfo.progress,
      xpToNext: levelInfo.toNext,
      currentThreshold: levelInfo.currentThreshold,
      nextThreshold: levelInfo.nextThreshold,
      stats: { totalCheckins, bestStreakOverall, perfectDays, distinctHabits },
      badges,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
