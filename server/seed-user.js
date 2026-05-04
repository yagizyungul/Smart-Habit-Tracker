require('dotenv').config();
const mongoose = require('mongoose');
const Habit = require('./src/models/Habit');
const Checkin = require('./src/models/Checkin');

const USER_ID = '69f8e402ea883b5abc50b434';

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function range(n) { return Array.from({ length: n }, (_, i) => i); }

function skip(days, rate) { return days.filter(() => Math.random() < rate); }

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB bağlandı');

  // Bu kullanıcıya ait eski verileri temizle
  await Habit.deleteMany({ userId: USER_ID });
  await Checkin.deleteMany({ userId: USER_ID });
  console.log('🗑️  Eski veriler temizlendi');

  const habits = await Habit.insertMany([
    { userId: USER_ID, title: 'Sabah koşusu',        frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#EF4444', icon: '🏃', reminderTime: '06:30' },
    { userId: USER_ID, title: 'Kitap okuma',          frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#1D9E75', icon: '📚', reminderTime: '21:00' },
    { userId: USER_ID, title: 'Su içme (2L)',          frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#3B82F6', icon: '💧' },
    { userId: USER_ID, title: 'Meditasyon',            frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#8B5CF6', icon: '🧘', reminderTime: '07:00' },
    { userId: USER_ID, title: 'Spor salonu',           frequency: 'custom', targetDays: [1,3,5],         color: '#F97316', icon: '💪' },
    { userId: USER_ID, title: 'Günlük yazma',          frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#F59E0B', icon: '✍️', reminderTime: '22:00' },
    { userId: USER_ID, title: 'İngilizce çalışma',    frequency: 'custom', targetDays: [1,2,3,4,5],     color: '#EC4899', icon: '📖', reminderTime: '19:00' },
    { userId: USER_ID, title: 'Sağlıklı beslenme',    frequency: 'daily',  targetDays: [0,1,2,3,4,5,6], color: '#10B981', icon: '🥗' },
  ]);

  // Her habit için gerçekçi check-in geçmişi (90 gün)
  const rates = [0.90, 0.85, 0.92, 0.78, 0.88, 0.72, 0.82, 0.88];
  const checkins = [];

  for (let h = 0; h < habits.length; h++) {
    const habit = habits[h];
    const allDays = range(90);
    const targetDays = habit.frequency === 'custom'
      ? allDays.filter(i => {
          const d = new Date(); d.setDate(d.getDate() - i);
          return habit.targetDays.includes(d.getDay());
        })
      : allDays;

    const kept = skip(targetDays, rates[h]);
    for (const daysAgo of kept) {
      checkins.push({
        habitId: habit._id,
        userId: USER_ID,
        date: dateStr(daysAgo),
        completed: true,
        note: '',
      });
    }
  }

  await Checkin.insertMany(checkins, { ordered: false }).catch(() => {});
  console.log(`✅ ${habits.length} habit, ${checkins.length} check-in eklendi`);

  // Özet
  for (const h of habits) {
    const count = checkins.filter(c => c.habitId.toString() === h._id.toString()).length;
    console.log(`   • ${h.title}: ${count} check-in`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Tamamlandı! yungul@gmail.com hesabı dolu.');
}

run().catch(err => { console.error(err); process.exit(1); });
