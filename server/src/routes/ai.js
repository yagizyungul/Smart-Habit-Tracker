const express = require('express');
const Groq = require('groq-sdk');
const protect = require('../middleware/auth');
const Habit = require('../models/Habit');
const Checkin = require('../models/Checkin');
const { calcStreak, calcCompletionRate } = require('../utils/streak');

const router = express.Router();
router.use(protect);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${userContext}` },
      ...history.slice(-6).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/parse-habit — doğal dil → habit objesi
router.post('/parse-habit', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Metin gerekli' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Sen bir alışkanlık parse edici sistemsin. Sadece geçerli JSON döndür, başka hiçbir şey yazma.',
        },
        {
          role: 'user',
          content: `Kullanıcı şunu söylüyor: "${text}"

Bu metni bir alışkanlık nesnesine dönüştür. Sadece JSON döndür:
{
  "title": "alışkanlık adı",
  "description": "kısa açıklama",
  "frequency": "daily" veya "weekly" veya "custom",
  "targetDays": [0,1,2,3,4,5,6],
  "reminderTime": "HH:MM" veya null,
  "color": "#hex"
}

Kurallar: daily→[0-6], hafta içi→[1,2,3,4,5], hafta sonu→[0,6]. Renk: spor=#EF4444, meditasyon=#8B5CF6, okuma=#1D9E75, su=#3B82F6, diğer=#7F77DD. Sadece JSON.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
