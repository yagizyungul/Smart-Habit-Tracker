const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const protect = require('../middleware/auth');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const { calcStreak, calcCompletionRate } = require('../utils/streak');

const router = express.Router();
router.use(protect);

// Gemini client'ı lazy olarak başlatıyoruz — API key eksikse route 404 yerine 503 döner
function getModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY ortam değişkeni tanımlı değil');
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const jsonModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
  return { model, jsonModel };
}

async function getUserContext(userId) {
  const today = new Date().toISOString().split('T')[0];
  const habits = await Habit.find({ userId, isActive: true });

  const todayCheckins = await Checkin.find({ userId, date: today, completed: true });
  const checkedIds = new Set(todayCheckins.map((c) => c.habitId.toString()));

  const habitDetails = await Promise.all(
    habits.map(async (h) => {
      const checkins = await Checkin.find({ habitId: h._id, userId, completed: true });
      const dates = checkins.map((c) => c.date);
      const start30 = new Date();
      start30.setDate(start30.getDate() - 29);
      const start30Str = start30.toISOString().split('T')[0];
      const { currentStreak, bestStreak } = calcStreak(dates, h.frequency, h.targetDays);
      const { completionRate } = calcCompletionRate(dates, start30Str, today, h.frequency, h.targetDays);
      return {
        name: h.title,
        frequency: h.frequency,
        currentStreak,
        bestStreak,
        completionRate30Days: completionRate,
        completedToday: checkedIds.has(h._id.toString()),
      };
    })
  );

  const completedTodayCount = habitDetails.filter((h) => h.completedToday).length;

  return `
Kullanıcının alışkanlık verileri (bugün: ${today}):
- Toplam aktif alışkanlık: ${habits.length}
- Bugün tamamlanan: ${completedTodayCount}/${habits.length}

Alışkanlık detayları:
${habitDetails.map((h) => `• ${h.name}: %${h.completionRate30Days} tamamlanma (son 30 gün), mevcut seri: ${h.currentStreak} gün, en iyi seri: ${h.bestStreak} gün, bugün tamamlandı: ${h.completedToday ? 'Evet' : 'Hayır'}`).join('\n')}
  `.trim();
}

const SYSTEM_PROMPT = `Sen "Streakly AI Coach" adında bir kişisel alışkanlık koçusun.
Kullanıcının habit tracker verilerine erişimin var ve bu verilere dayanarak kişiselleştirilmiş, motive edici tavsiyelerde bulunuyorsun.
Her zaman Türkçe konuşuyorsun. Samimi, motive edici ve kısa cevaplar veriyorsun (maksimum 3-4 cümle).
Kullanıcının verilerini analiz edip spesifik, uygulanabilir öneriler sunuyorsun.
Asla genel tavsiyeler verme — her zaman kullanıcının kendi verilerine atıfta bulun.`;

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Mesaj gerekli' });

    const userContext = await getUserContext(req.user.id);

    const { model } = getModels();
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userContext}` }] },
        { role: 'model', parts: [{ text: 'Anlaşıldı, hazırım. Nasıl yardımcı olabilirim?' }] },
        ...history.slice(-6).map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
      ],
    });
    
    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/insights — Dashboard için proaktif haftalık içgörüler
router.get('/insights', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habits = await Habit.find({ userId, isActive: true });
    if (habits.length === 0) {
      return res.json({ insights: [] });
    }

    const start7 = new Date(); start7.setDate(start7.getDate() - 6);
    const start7Str = start7.toISOString().split('T')[0];
    const start30 = new Date(); start30.setDate(start30.getDate() - 29);
    const start30Str = start30.toISOString().split('T')[0];

    const recent = await Checkin.find({
      userId,
      completed: true,
      date: { $gte: start30Str, $lte: today },
    });
    const last7Set = new Set(recent.filter((c) => c.date >= start7Str).map((c) => `${c.habitId}_${c.date}`));
    const dateSet = new Set(recent.map((c) => `${c.habitId}_${c.date}`));

    // Heuristik içgörüler — AI çağrısı yapmadan deterministik
    const insights = [];

    // 1) En iyi seri
    let best = { title: '', streak: 0 };
    let weakest = { title: '', rate: 100 };
    for (const habit of habits) {
      const dates = recent.filter((c) => c.habitId.toString() === habit._id.toString()).map((c) => c.date);
      const { currentStreak, bestStreak } = calcStreak(dates, habit.frequency, habit.targetDays);
      const { completionRate } = calcCompletionRate(dates, start30Str, today, habit.frequency, habit.targetDays);

      if (currentStreak >= 5 && currentStreak > best.streak) {
        best = { title: habit.title, streak: currentStreak, _id: habit._id };
      }
      if (completionRate < weakest.rate && completionRate < 60) {
        weakest = { title: habit.title, rate: completionRate, _id: habit._id, bestStreak };
      }
    }

    if (best.streak > 0) {
      insights.push({
        kind: 'streak',
        emoji: '🔥',
        title: `${best.streak} günlük seri!`,
        body: `"${best.title}" alışkanlığında harikasın. Bu ivmeyi koru.`,
      });
    }

    if (weakest._id) {
      insights.push({
        kind: 'weak',
        emoji: '🎯',
        title: 'Daha çok dikkat gerektiren alışkanlık',
        body: `"${weakest.title}" son 30 günde sadece %${weakest.rate} tamamlandı. Saatini değiştirmeyi veya hedefini küçültmeyi denemeyi düşünebilirsin.`,
      });
    }

    // 2) Son 7 gün vs önceki 7 gün
    const start14 = new Date(); start14.setDate(start14.getDate() - 13);
    const start14Str = start14.toISOString().split('T')[0];
    const prev7Set = new Set(
      recent
        .filter((c) => c.date >= start14Str && c.date < start7Str)
        .map((c) => `${c.habitId}_${c.date}`)
    );
    const last7Count = last7Set.size;
    const prev7Count = prev7Set.size;
    if (last7Count > prev7Count + 2) {
      insights.push({
        kind: 'trend',
        emoji: '📈',
        title: 'Yükselişte!',
        body: `Son 7 günde ${last7Count} check-in yaptın — bir önceki haftaya göre ${last7Count - prev7Count} fazla.`,
      });
    } else if (prev7Count > last7Count + 2) {
      insights.push({
        kind: 'trend',
        emoji: '🌊',
        title: 'Tempo düşüyor',
        body: `Bu hafta ${last7Count} check-in yaptın, geçen hafta ${prev7Count}'di. Küçük bir hedefle yeniden ısınmayı dene.`,
      });
    }

    // 3) Haftanın en zayıf günü
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayExp = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dow = d.getDay();
      for (const h of habits) {
        const isTarget = h.frequency === 'daily' || h.targetDays.includes(dow);
        if (!isTarget) continue;
        dayExp[dow]++;
        if (dateSet.has(`${h._id}_${ds}`)) dayCounts[dow]++;
      }
    }
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    let worstDay = -1;
    let worstRate = 1.1;
    for (let i = 0; i < 7; i++) {
      if (dayExp[i] === 0) continue;
      const r = dayCounts[i] / dayExp[i];
      if (r < worstRate && r < 0.6) {
        worstRate = r;
        worstDay = i;
      }
    }
    if (worstDay >= 0) {
      insights.push({
        kind: 'pattern',
        emoji: '📅',
        title: `${dayNames[worstDay]} günleri zorlanıyorsun`,
        body: `${dayNames[worstDay]} günleri tamamlama oranın yalnızca %${Math.round(worstRate * 100)}. Hatırlatıcılarını bu güne yoğunlaştırmayı deneyebilirsin.`,
      });
    }

    // 4) Bugünkü durum
    const todayCheckins = recent.filter((c) => c.date === today);
    const completedToday = new Set(todayCheckins.map((c) => c.habitId.toString())).size;
    const expectedToday = habits.filter((h) => {
      const dow = new Date().getDay();
      return h.frequency === 'daily' || h.targetDays.includes(dow);
    }).length;
    if (expectedToday > 0) {
      const remain = expectedToday - completedToday;
      if (remain === 0) {
        insights.push({
          kind: 'today',
          emoji: '✨',
          title: 'Mükemmel gün!',
          body: 'Bugün için tüm alışkanlıkları tamamladın. Kendine bir an mola ver.',
        });
      } else if (remain <= 2 && completedToday > 0) {
        insights.push({
          kind: 'today',
          emoji: '⏳',
          title: `${remain} alışkanlık kaldı`,
          body: 'Bir mükemmel günden çok az kaldı — küçük bir itki yeter.',
        });
      }
    }

    res.json({ insights: insights.slice(0, 4) });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/parse-habit — doğal dil → habit objesi
router.post('/parse-habit', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Metin gerekli' });

    const prompt = `Kullanıcı şunu söylüyor: "${text}"

Bu metni bir alışkanlık nesnesine dönüştür. Sadece JSON döndür:
{
  "title": "alışkanlık adı",
  "description": "kısa açıklama",
  "frequency": "daily" veya "weekly" veya "custom",
  "targetDays": [0,1,2,3,4,5,6],
  "reminderTime": "HH:MM" veya null,
  "color": "#hex"
}

Kurallar: daily→[0-6], hafta içi→[1,2,3,4,5], hafta sonu→[0,6]. Renk: spor=#EF4444, meditasyon=#8B5CF6, okuma=#1D9E75, su=#3B82F6, diğer=#7F77DD.`;

    const { jsonModel } = getModels();
    const result = await jsonModel.generateContent(prompt);
    const reply = result.response.text();
    const parsed = JSON.parse(reply);
    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
