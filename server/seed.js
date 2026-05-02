require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Habit = require('./src/models/Habit');
const Checkin = require('./src/models/Checkin');

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function randomSkip(arr, keepChance = 0.85) {
  return arr.filter(() => Math.random() < keepChance);
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB bağlandı');

  // Temizle
  await User.deleteMany({});
  await Habit.deleteMany({});
  await Checkin.deleteMany({});
  console.log('🗑️  Eski veriler silindi');

  // --- KULLANICI 1: Yağız ---
  const yagiz = await User.create({
    name: 'yağız yungul',
    email: 'yagiz@test.com',
    password: 'test1234',
  });

  const yagizHabits = await Habit.insertMany([
    { userId: yagiz._id, title: 'Sabah koşusu', description: '06:30\'da park koşusu', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#7F77DD', icon: 'run', reminderTime: '06:30' },
    { userId: yagiz._id, title: 'Kitap okuma', description: 'Her gün en az 30 dakika', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#1D9E75', icon: 'book', reminderTime: '21:00' },
    { userId: yagiz._id, title: 'Su içme', description: 'Günde 2 litre su', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#3B82F6', icon: 'water' },
    { userId: yagiz._id, title: 'Meditasyon', description: '10 dakika nefes egzersizi', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#F59E0B', icon: 'meditate', reminderTime: '07:00' },
    { userId: yagiz._id, title: 'Spor salonu', description: 'Hafta 3 gün antrenman', frequency: 'custom', targetDays: [1,3,5], color: '#EF4444', icon: 'gym' },
  ]);

  const yagizCheckins = [];
  for (const habit of yagizHabits) {
    const days = habit.frequency === 'custom'
      ? range(60).filter(i => {
          const d = new Date(); d.setDate(d.getDate() - i);
          return habit.targetDays.includes(d.getDay());
        })
      : range(60);
    const kept = randomSkip(days, 0.88);
    for (const daysAgo of kept) {
      yagizCheckins.push({ habitId: habit._id, userId: yagiz._id, date: dateStr(daysAgo), completed: true });
    }
  }
  await Checkin.insertMany(yagizCheckins, { ordered: false }).catch(() => {});
  console.log(`✅ Yağız: ${yagizHabits.length} habit, ${yagizCheckins.length} check-in`);

  // --- KULLANICI 2: Ege ---
  const ege = await User.create({
    name: 'ege demir',
    email: 'ege@test.com',
    password: 'test1234',
  });

  const egeHabits = await Habit.insertMany([
    { userId: ege._id, title: 'Kod yazma', description: 'Her gün en az 1 saat', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#7F77DD', icon: 'code', reminderTime: '20:00' },
    { userId: ege._id, title: 'Yürüyüş', description: '8000 adım', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#1D9E75', icon: 'walk' },
    { userId: ege._id, title: 'İngilizce çalışma', description: 'Duolingo + podcast', frequency: 'custom', targetDays: [1,2,3,4,5], color: '#F59E0B', icon: 'language', reminderTime: '19:00' },
    { userId: ege._id, title: 'Günlük yazma', description: 'Gün özeti yaz', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#8B5CF6', icon: 'journal', reminderTime: '22:30' },
  ]);

  const egeCheckins = [];
  for (const habit of egeHabits) {
    const days = habit.frequency === 'custom'
      ? range(60).filter(i => {
          const d = new Date(); d.setDate(d.getDate() - i);
          return habit.targetDays.includes(d.getDay());
        })
      : range(60);
    const kept = randomSkip(days, 0.82);
    for (const daysAgo of kept) {
      egeCheckins.push({ habitId: habit._id, userId: ege._id, date: dateStr(daysAgo), completed: true });
    }
  }
  await Checkin.insertMany(egeCheckins, { ordered: false }).catch(() => {});
  console.log(`✅ Ege: ${egeHabits.length} habit, ${egeCheckins.length} check-in`);

  // --- KULLANICI 3: Demo ---
  const demo = await User.create({
    name: 'Demo Kullanıcı',
    email: 'demo@test.com',
    password: 'test1234',
  });

  const demoHabits = await Habit.insertMany([
    { userId: demo._id, title: 'Erken uyanmak', description: 'Saat 06:00\'da kalk', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#F59E0B', icon: 'sun', reminderTime: '06:00' },
    { userId: demo._id, title: 'Vitamin almak', description: 'Sabah vitamini', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#EF4444', icon: 'pill' },
    { userId: demo._id, title: 'Esneme', description: '15 dakika stretching', frequency: 'custom', targetDays: [0,2,4,6], color: '#1D9E75', icon: 'stretch' },
    { userId: demo._id, title: 'Sosyal medya detoksu', description: 'Günde max 30 dk', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#3B82F6', icon: 'phone' },
    { userId: demo._id, title: 'Sağlıklı beslenme', description: 'Sebze/meyve tüket', frequency: 'daily', targetDays: [0,1,2,3,4,5,6], color: '#10B981', icon: 'food' },
    { userId: demo._id, title: 'Yoga', description: 'Hafta sonu yoga', frequency: 'custom', targetDays: [0,6], color: '#8B5CF6', icon: 'yoga', reminderTime: '09:00' },
  ]);

  const demoCheckins = [];
  for (const habit of demoHabits) {
    const days = habit.frequency === 'custom'
      ? range(90).filter(i => {
          const d = new Date(); d.setDate(d.getDate() - i);
          return habit.targetDays.includes(d.getDay());
        })
      : range(90);
    const kept = randomSkip(days, 0.78);
    for (const daysAgo of kept) {
      demoCheckins.push({ habitId: habit._id, userId: demo._id, date: dateStr(daysAgo), completed: true });
    }
  }
  await Checkin.insertMany(demoCheckins, { ordered: false }).catch(() => {});
  console.log(`✅ Demo: ${demoHabits.length} habit, ${demoCheckins.length} check-in`);

  console.log('\n🎉 Seed tamamlandı!\n');
  console.log('Giriş bilgileri (hepsi şifre: test1234):');
  console.log('  yagiz@test.com');
  console.log('  ege@test.com');
  console.log('  demo@test.com');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
