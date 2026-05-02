const express = require('express');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const protect = require('../middleware/auth');
const { calcStreak, calcCompletionRate } = require('../utils/streak');

const router = express.Router();

router.use(protect);

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habits = await Habit.find({ userId: req.user.id, isActive: true });

    // Bugünkü check-in'ler
    const todayCheckins = await Checkin.find({ userId: req.user.id, date: today, completed: true });
    const checkedHabitIds = new Set(todayCheckins.map((c) => c.habitId.toString()));

    const todayProgress = { completed: checkedHabitIds.size, total: habits.length };

    // Haftalık yüzde — son 7 gün
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayCheckins = await Checkin.find({ userId: req.user.id, date: dateStr, completed: true });
      const pct = habits.length > 0 ? Math.round((dayCheckins.length / habits.length) * 100) : 0;
      weeklyData.push({ day: DAY_NAMES[d.getDay()], pct });
    }

    // En uzun streak
    let bestStreakData = { habitId: null, habitTitle: '', streak: 0 };
    for (const habit of habits) {
      const checkins = await Checkin.find({ habitId: habit._id, userId: req.user.id, completed: true });
      const dates = checkins.map((c) => c.date);
      const { currentStreak } = calcStreak(dates, habit.frequency, habit.targetDays);
      if (currentStreak > bestStreakData.streak) {
        bestStreakData = { habitId: habit._id, habitTitle: habit.title, streak: currentStreak };
      }
    }

    // Aylık tamamlanma oranı
    const start30 = daysAgo(29);
    const allCheckins30 = await Checkin.find({
      userId: req.user.id,
      date: { $gte: start30, $lte: today },
      completed: true,
    });

    const checkinDateSet = new Set(allCheckins30.map((c) => `${c.habitId}_${c.date}`));
    let totalExpected = 0;
    let totalCompleted = 0;
    let perfectDays = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let dayExpected = 0;
      let dayCompleted = 0;
      for (const habit of habits) {
        const dayOfWeek = d.getDay();
        const isTarget = habit.frequency === 'daily' || habit.targetDays.includes(dayOfWeek);
        if (!isTarget) continue;
        dayExpected++;
        totalExpected++;
        if (checkinDateSet.has(`${habit._id}_${dateStr}`)) {
          dayCompleted++;
          totalCompleted++;
        }
      }
      if (dayExpected > 0 && dayExpected === dayCompleted) perfectDays++;
    }

    const monthlyCompletion = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    res.json({ todayProgress, weeklyData, bestStreak: bestStreakData, monthlyCompletion, perfectDays });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/habit/:habitId
router.get('/habit/:habitId', async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Alışkanlık bulunamadı' });

    const today = new Date().toISOString().split('T')[0];
    const start30 = daysAgo(29);

    const checkins = await Checkin.find({
      habitId: habit._id,
      userId: req.user.id,
      completed: true,
    });

    const allDates = checkins.map((c) => c.date);
    const { currentStreak, bestStreak } = calcStreak(allDates, habit.frequency, habit.targetDays);
    const { completionRate, completedDays, totalExpected } = calcCompletionRate(
      allDates,
      start30,
      today,
      habit.frequency,
      habit.targetDays
    );

    res.json({
      currentStreak,
      bestStreak,
      completionRate,
      completedDays,
      totalExpected,
      completedDates: allDates.sort((a, b) => (a > b ? -1 : 1)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/overview
router.get('/overview', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habits = await Habit.find({ userId: req.user.id, isActive: true });

    // Habit bazında istatistikler
    const habitsData = await Promise.all(
      habits.map(async (habit) => {
        const checkins = await Checkin.find({ habitId: habit._id, userId: req.user.id, completed: true });
        const allDates = checkins.map((c) => c.date);
        const start30 = daysAgo(29);
        const { completionRate } = calcCompletionRate(allDates, start30, today, habit.frequency, habit.targetDays);
        const { currentStreak } = calcStreak(allDates, habit.frequency, habit.targetDays);
        return { habitId: habit._id, title: habit.title, color: habit.color, completionRate, streak: currentStreak };
      })
    );

    // Aylık trend — son 4 ay
    const monthlyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const monthStart = d.toISOString().split('T')[0];
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthEnd = lastDay.toISOString().split('T')[0];

      const checkins = await Checkin.find({
        userId: req.user.id,
        date: { $gte: monthStart, $lte: monthEnd },
        completed: true,
      });

      let exp = 0;
      let comp = 0;
      const checkinSet = new Set(checkins.map((c) => `${c.habitId}_${c.date}`));
      const endBound = monthEnd < today ? monthEnd : today;

      for (const habit of habits) {
        const { completedDays, totalExpected } = calcCompletionRate(
          checkins.filter((c) => c.habitId.toString() === habit._id.toString()).map((c) => c.date),
          monthStart,
          endBound,
          habit.frequency,
          habit.targetDays
        );
        exp += totalExpected;
        comp += completedDays;
      }

      const pct = exp > 0 ? Math.round((comp / exp) * 100) : 0;
      monthlyTrend.push({ month: MONTH_NAMES_TR[d.getMonth()], pct });
    }

    // Son 30 gün günlük
    const dailyLast30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayCheckins = await Checkin.find({ userId: req.user.id, date: dateStr, completed: true });
      const pct = habits.length > 0 ? Math.round((dayCheckins.length / habits.length) * 100) : 0;
      dailyLast30.push({ date: dateStr, pct });
    }

    res.json({ habits: habitsData, monthlyTrend, dailyLast30 });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/export — CSV
router.get('/export', async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    const habitMap = Object.fromEntries(habits.map((h) => [h._id.toString(), h.title]));

    const checkins = await Checkin.find({ userId: req.user.id }).sort({ date: -1 });

    const rows = [['date', 'habit', 'completed']];
    for (const c of checkins) {
      const habitTitle = habitMap[c.habitId.toString()] || c.habitId.toString();
      rows.push([c.date, `"${habitTitle.replace(/"/g, '""')}"`, c.completed]);
    }

    const csv = rows.map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="habits-export.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
