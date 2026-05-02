const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReminderEmail(user, incompleteHabits) {
  const habitList = incompleteHabits
    .map((h) => `  • ${h.title}`)
    .join('\n');

  await transporter.sendMail({
    from: `"Smart Habit Tracker" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: '🎯 Bugün tamamlanmayan alışkanlıkların var!',
    text: `Merhaba ${user.name},\n\nBugün henüz tamamlamadığın alışkanlıklar:\n\n${habitList}\n\nHaydi, bu günü de streak'ini koru!\n\n— Smart Habit Tracker`,
    html: `
      <h2>Merhaba ${user.name} 👋</h2>
      <p>Bugün henüz tamamlamadığın alışkanlıklar:</p>
      <ul>${incompleteHabits.map((h) => `<li><strong>${h.title}</strong></li>`).join('')}</ul>
      <p>Haydi, bu günü de streak'ini koru! 🔥</p>
      <small>— Smart Habit Tracker</small>
    `,
  });
}

async function runDailyReminder() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDayOfWeek = new Date().getDay();

    const users = await User.find({});

    for (const user of users) {
      const habits = await Habit.find({ userId: user._id, isActive: true });
      const todayCheckins = await Checkin.find({ userId: user._id, date: today, completed: true });
      const checkedHabitIds = new Set(todayCheckins.map((c) => c.habitId.toString()));

      const incompleteHabits = habits.filter((h) => {
        const isTarget = h.frequency === 'daily' || h.targetDays.includes(todayDayOfWeek);
        return isTarget && !checkedHabitIds.has(h._id.toString());
      });

      if (incompleteHabits.length > 0) {
        await sendReminderEmail(user, incompleteHabits);
        console.log(`Reminder sent to ${user.email} for ${incompleteHabits.length} habits`);
      }
    }
  } catch (err) {
    console.error('Daily reminder error:', err.message);
  }
}

function startReminderScheduler() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('SMTP config eksik — e-mail hatırlatıcı devre dışı');
    return;
  }

  // Her gün 20:00'de çalışır
  cron.schedule('0 20 * * *', runDailyReminder, { timezone: 'Europe/Istanbul', name: 'daily-reminder' });
  console.log('📧 E-mail hatırlatıcı scheduler başlatıldı (her gün 20:00)');
}

module.exports = { startReminderScheduler, runDailyReminder };
