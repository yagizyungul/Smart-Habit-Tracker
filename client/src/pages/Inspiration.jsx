import { useState, useEffect } from 'react'

const BOOKS = [
  { id: 1, title: 'Atomic Habits', author: 'James Clear', year: 2018, emoji: '⚛️', desc: 'Küçük alışkanlık değişiklikleriyle sürpriz sonuçlar elde etme sanatı.', descEn: 'Tiny changes, remarkable results — the definitive guide to building good habits.', link: 'https://www.goodreads.com/book/show/40121378-atomic-habits', color: '#7F77DD' },
  { id: 2, title: 'The Power of Habit', author: 'Charles Duhigg', year: 2012, emoji: '🔄', desc: 'Alışkanlık döngüsünü anlayarak yaşamı ve işi nasıl değiştirebileceğinizi keşfedin.', descEn: 'Why we do what we do in life and business — the science of habit formation.', link: 'https://www.goodreads.com/book/show/12609433-the-power-of-habit', color: '#1D9E75' },
  { id: 3, title: 'Tiny Habits', author: 'BJ Fogg', year: 2019, emoji: '🌱', desc: 'Küçük davranış değişiklikleri yaparak büyük hayat dönüşümü başlatın.', descEn: 'The small changes that change everything — behavior design made simple.', link: 'https://www.goodreads.com/book/show/43261127-tiny-habits', color: '#F59E0B' },
  { id: 4, title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', year: 1989, emoji: '🎯', desc: 'Kişisel ve profesyonel başarı için yedi temel alışkanlığı öğrenin.', descEn: 'Powerful lessons in personal change for enduring effectiveness.', link: 'https://www.goodreads.com/book/show/36072.The_7_Habits_of_Highly_Effective_People', color: '#EF4444' },
  { id: 5, title: 'Better Than Before', author: 'Gretchen Rubin', year: 2015, emoji: '📈', desc: 'Kişilik tipinize göre özelleştirilmiş alışkanlık değişikliği stratejileri.', descEn: 'Mastering the habits of our everyday lives through self-knowledge.', link: 'https://www.goodreads.com/book/show/22889767-better-than-before', color: '#8B5CF6' },
  { id: 6, title: 'The Compound Effect', author: 'Darren Hardy', year: 2010, emoji: '📊', desc: 'Günlük küçük kararlarının bileşik etkisinin gücünü keşfedin.', descEn: 'Jumpstart your income, life, and success with small, consistent actions.', link: 'https://www.goodreads.com/book/show/9420697-the-compound-effect', color: '#3B82F6' },
  { id: 7, title: 'Mindset', author: 'Carol Dweck', year: 2006, emoji: '🧠', desc: 'Sabit düşünceden büyüme düşüncesine geçerek sınırsız başarıya ulaşın.', descEn: 'The new psychology of success — fixed vs growth mindset.', link: 'https://www.goodreads.com/book/show/40745.Mindset', color: '#10B981' },
  { id: 8, title: 'Getting Things Done', author: 'David Allen', year: 2001, emoji: '✅', desc: 'Zihinsel eğitim yaparak stressiz verimlilik sistemini uygulayın.', descEn: 'The art of stress-free productivity through trusted systems.', link: 'https://www.goodreads.com/book/show/1633.Getting_Things_Done', color: '#F97316' },
  { id: 9, title: 'Essentialism', author: 'Greg McKeown', year: 2014, emoji: '⭐', desc: 'Daha az yapmak için daha çok disiplin uygulayarak hakiki başarıya ulaşın.', descEn: 'The disciplined pursuit of less — do less, but better.', link: 'https://www.goodreads.com/book/show/18077875-essentialism', color: '#6366F1' },
  { id: 10, title: 'Habit Stacking', author: 'S.J. Scott', year: 2016, emoji: '🔗', desc: 'Mevcut alışkanlıklarınıza yeni alışkanlıklar ekleyerek güçlü ritüeller oluşturun.', descEn: '127 small changes to improve your health, wealth, and happiness.', link: 'https://www.goodreads.com/book/show/34668961-habit-stacking', color: '#EC4899' },
]

const QUOTES_TR = [
  { q: 'Damlaya damlaya göl olur.', a: 'Türk Atasözü' },
  { q: 'Kalite bir eylem değil, bir alışkanlıktır.', a: 'Aristoteles' },
  { q: 'Motivasyon sizi başlatır, alışkanlık sizi devam ettirir.', a: 'Jim Rohn' },
  { q: 'Hayatınızı değiştirmek istiyorsanız, her gün yaptığınız bir şeyi değiştirmeniz gerekir.', a: 'John C. Maxwell' },
  { q: 'Küçük taşlar büyük duvarı oluşturur.', a: 'Türk Atasözü' },
  { q: 'Sabır acı, ama meyvesi tatlıdır.', a: 'Türk Atasözü' },
  { q: 'Kötü alışkanlıkları kırmak zordur; iyilerini oluşturmak ise ödüllendiricidir.', a: 'Benjamin Franklin' },
  { q: 'Ne kadar yavaş gittiğin önemli değil, asıl önemli olan durmamaktır.', a: 'Konfüçyüs' },
  { q: 'İnançların düşüncelerine, düşüncelerin alışkanlıklarına, alışkanlıkların karakterine dönüşür.', a: 'Mahatma Gandhi' },
  { q: 'Değişimin sırrı, eskiyle savaşmak değil, yeniyi inşa etmeye odaklanmaktır.', a: 'Sokrates' },
]

const QUOTES_EN = [
  { q: 'Quality is not an act, it is a habit.', a: 'Aristotle' },
  { q: 'We are what we repeatedly do. Excellence is not an act but a habit.', a: 'Will Durant' },
  { q: 'Motivation is what gets you started. Habit is what keeps you going.', a: 'Jim Rohn' },
  { q: "You'll never change your life until you change something you do daily.", a: 'John C. Maxwell' },
  { q: 'Small daily improvements over time lead to stunning results.', a: 'Robin Sharma' },
  { q: 'The secret of your success is found in your daily routine.', a: 'John C. Maxwell' },
  { q: 'It is easier to prevent bad habits than to break them.', a: 'Benjamin Franklin' },
  { q: 'No matter how slow you go, you are still lapping everybody on the couch.', a: 'Unknown' },
  { q: 'Your beliefs become your thoughts, your thoughts become your habits, your habits become your destiny.', a: 'Mahatma Gandhi' },
  { q: 'The secret of change is to focus all your energy on building the new.', a: 'Socrates' },
]

const PLAYLISTS = [
  { name: 'Lo-fi Hip Hop Radio', type: 'Lo-Fi', emoji: '🎧', desc: 'Çalışma ve odaklanma için beats', descEn: 'Beats to relax and study to', platform: 'YouTube', color: '#7F77DD', link: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { name: 'Deep Focus', type: 'Ambient', emoji: '🌊', desc: 'Derin odaklanma için ambient müzik', descEn: 'Ambient electronic for deep work', platform: 'Spotify', color: '#1D9E75', link: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
  { name: 'Classical for Focus', type: 'Klasik', emoji: '🎻', desc: 'Konsantrasyon için klasik müzik', descEn: 'Classical compositions for concentration', platform: 'Spotify', color: '#F59E0B', link: 'https://open.spotify.com/playlist/3CBYNVkyR8ZCafnPKv2w8k' },
  { name: 'Nature & Rain Sounds', type: 'Doğa Sesleri', emoji: '🌧️', desc: 'Yağmur ve doğa sesleri ile huzur', descEn: 'Soothing rain and forest sounds', platform: 'YouTube', color: '#3B82F6', link: 'https://www.youtube.com/watch?v=q76bMs-NwRk' },
]

export default function Inspiration() {
  const [lang, setLang] = useState('tr')
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [activeTab, setActiveTab] = useState('books')

  const quotes = lang === 'tr' ? QUOTES_TR : QUOTES_EN

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % quotes.length), 6000)
    return () => clearInterval(t)
  }, [quotes.length])

  const tr = lang === 'tr'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>
            {tr ? '✨ İlham Merkezi' : '✨ Inspiration Hub'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            {tr ? 'Kitaplar, sözler ve odaklanma müziği' : 'Books, quotes and focus music'}
          </p>
        </div>
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border"
          style={{ borderColor: '#7F77DD', color: '#7F77DD', background: '#f1f0ff' }}
        >
          {lang === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          <span style={{ color: '#aaa' }}>→</span>
          {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
        </button>
      </div>

      {/* Quote Card */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)' }}>
        <div className="absolute top-0 right-0 text-9xl opacity-10 select-none leading-none">❝</div>
        <p className="text-lg font-medium leading-relaxed mb-3 relative z-10">"{quotes[quoteIdx].q}"</p>
        <p className="text-white/70 text-sm relative z-10">— {quotes[quoteIdx].a}</p>
        <div className="flex gap-1.5 mt-4">
          {quotes.map((_, i) => (
            <button key={i} onClick={() => setQuoteIdx(i)} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === quoteIdx ? 'white' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f1f0ff' }}>
        {[
          { id: 'books', label: tr ? '📚 Kitaplar' : '📚 Books' },
          { id: 'music', label: tr ? '🎵 Müzik' : '🎵 Music' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab.id ? { background: 'white', color: '#7F77DD', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: '#64748b' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Books */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BOOKS.map((book, i) => (
            <a key={book.id} href={book.link} target="_blank" rel="noopener noreferrer"
              className="flex gap-4 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'white', borderColor: '#e2e0f9', textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: book.color + '18' }}>
                {book.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight" style={{ color: '#1a1a2e' }}>{book.title}</p>
                  <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>#{i + 1}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: book.color }}>{book.author} · {book.year}</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#64748b' }}>{tr ? book.desc : book.descEn}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Music */}
      {activeTab === 'music' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAYLISTS.map((p) => (
            <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer"
              className="p-5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 block"
              style={{ background: 'white', borderColor: '#e2e0f9', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: p.color + '18' }}>
                  {p.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{p.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: p.color + '18', color: p.color }}>{p.type}</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{tr ? p.desc : p.descEn}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-medium" style={{ color: p.color }}>{p.platform}</span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>→ {tr ? 'Aç' : 'Open'}</span>
              </div>
            </a>
          ))}
          <div className="p-5 rounded-xl border col-span-full" style={{ background: '#f8f7ff', borderColor: '#e2e0f9', borderStyle: 'dashed' }}>
            <p className="text-sm text-center" style={{ color: '#94a3b8' }}>
              {tr ? '💡 İpucu: Odak müziği alışkanlık tamamlama oranını %23 artırır.' : '💡 Tip: Focus music increases habit completion rates by 23%.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
