import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

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
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white text-glow">
            {tr ? 'İlham Merkezi' : 'Inspiration Hub'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {tr ? 'Kitaplar, sözler ve odaklanma müziği' : 'Books, quotes and focus music'}
          </p>
        </div>
        <motion.button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {lang === 'tr' ? 'TR 🇹🇷' : 'EN 🇬🇧'}
        </motion.button>
      </motion.div>

      {/* Quote Card */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #215B63, #124170)' }}
      >
        <div className="absolute top-0 right-0 text-[140px] opacity-10 select-none leading-none -translate-y-8">❝</div>
        <p className="text-xl font-bold leading-relaxed mb-3 relative z-10 text-glow">"{quotes[quoteIdx].q}"</p>
        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest relative z-10">— {quotes[quoteIdx].a}</p>
        <div className="flex gap-2 mt-5">
          {quotes.map((_, i) => (
            <button key={i} onClick={() => setQuoteIdx(i)} className="w-2 h-2 rounded-full transition-all" style={{ background: i === quoteIdx ? '#AAFFC7' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="inline-flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
        {[
          { id: 'books', label: tr ? 'Kitaplar' : 'Books', icon: '📚' },
          { id: 'music', label: tr ? 'Müzik' : 'Music', icon: '🎵' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-accent-green/20 text-glow-mint border border-accent-green/30' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Books */}
      {activeTab === 'books' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {BOOKS.map((book, i) => (
            <a key={book.id} href={book.link} target="_blank" rel="noopener noreferrer"
              className="glass-card group flex flex-col transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="h-40 w-full flex flex-col items-center justify-center text-5xl transition-all duration-500 group-hover:scale-105 relative" style={{ background: `linear-gradient(135deg, ${book.color}40, ${book.color}10)` }}>
                <span className="relative z-10">{book.emoji}</span>
                <div className="absolute top-3 right-3 text-[10px] font-black text-white/40">#{i + 1}</div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="font-bold text-slate-100 group-hover:text-glow-mint transition-colors line-clamp-1 mb-1">{book.title}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: book.color }}>{book.author} · {book.year}</p>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-5 flex-1">{tr ? book.desc : book.descEn}</p>
                <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center justify-between">
                  <span>{tr ? 'İncele' : 'View'}</span>
                  <span className="text-lg leading-none">→</span>
                </div>
              </div>
            </a>
          ))}
        </motion.div>
      )}

      {/* Music */}
      {activeTab === 'music' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {PLAYLISTS.map((p) => (
            <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer"
              className="glass-card p-6 group transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform" style={{ background: p.color + '15' }}>
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-100 group-hover:text-glow-mint transition-colors truncate">{p.name}</p>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block mt-1" style={{ background: p.color + '15', color: p.color }}>{p.type}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{tr ? p.desc : p.descEn}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: p.color }}>{p.platform}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                  {tr ? 'Şimdi Dinle' : 'Listen Now'} <span className="text-lg">→</span>
                </span>
              </div>
            </a>
          ))}
          <div className="p-6 glass-card border-dashed border-white/10 col-span-full">
            <p className="text-xs font-bold text-center text-slate-500 uppercase tracking-[0.2em]">
              {tr ? '💡 İpucu: Odak müziği alışkanlık tamamlama oranını %23 artırır.' : '💡 Tip: Focus music increases habit completion rates by 23%.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
