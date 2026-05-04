import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

const HABIT_SUGGESTIONS = [
  { emoji: '🏃', label: 'Spor / Koşu', title: 'Sabah koşusu', frequency: 'daily', color: '#EF4444', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '📚', label: 'Kitap okuma', title: 'Kitap okuma', frequency: 'daily', color: '#1D9E75', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '💧', label: 'Su içme', title: 'Su içme (2L)', frequency: 'daily', color: '#3B82F6', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '🧘', label: 'Meditasyon', title: 'Meditasyon', frequency: 'daily', color: '#8B5CF6', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '💪', label: 'Spor salonu', title: 'Spor salonu', frequency: 'custom', color: '#F97316', targetDays: [1,3,5] },
  { emoji: '🌙', label: 'Erken yatmak', title: 'Erken yatmak', frequency: 'daily', color: '#6366F1', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '🥗', label: 'Sağlıklı beslenme', title: 'Sağlıklı beslenme', frequency: 'daily', color: '#10B981', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '✍️', label: 'Günlük yazma', title: 'Günlük yazma', frequency: 'daily', color: '#F59E0B', targetDays: [0,1,2,3,4,5,6] },
  { emoji: '📖', label: 'Yabancı dil', title: 'İngilizce çalışma', frequency: 'custom', color: '#EC4899', targetDays: [1,2,3,4,5] },
  { emoji: '🎯', label: 'Hedef gözden geçirme', title: 'Hedef gözden geçirme', frequency: 'weekly', color: '#7F77DD', targetDays: [1] },
]

const GOALS = [
  { id: 'health', emoji: '❤️', label: 'Sağlıklı Yaşam' },
  { id: 'productivity', emoji: '⚡', label: 'Verimlilik' },
  { id: 'mindfulness', emoji: '🧘', label: 'Zihinsel Huzur' },
  { id: 'learning', emoji: '📚', label: 'Öğrenme & Gelişim' },
  { id: 'fitness', emoji: '💪', label: 'Fitness' },
  { id: 'social', emoji: '🤝', label: 'Sosyal İlişkiler' },
]

const STEPS = ['Hoşgeldin', 'Hedefler', 'Alışkanlıklar', 'Hazır!']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [goals, setGoals] = useState([])
  const [selectedHabits, setSelectedHabits] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id) => setGoals((g) => g.includes(id) ? g.filter((x) => x !== id) : [...g, id])
  const toggleHabit = (idx) => setSelectedHabits((h) => h.includes(idx) ? h.filter((x) => x !== idx) : [...h, idx])

  const finish = async () => {
    setLoading(true)
    try {
      for (const idx of selectedHabits) {
        const h = HABIT_SUGGESTIONS[idx]
        await api.post('/api/habits', {
          title: h.title,
          frequency: h.frequency,
          targetDays: h.targetDays,
          color: h.color,
          icon: h.emoji,
        })
      }
      localStorage.setItem('onboarding_done', 'true')
      navigate('/dashboard')
    } catch {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(170,255,199,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(103,192,144,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-xl relative z-10">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 shadow-lg ${
                  i <= step ? 'bg-accent-green text-[#124170] shadow-accent-green/20' : 'bg-white/5 text-slate-500 border border-white/10'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 hidden sm:block ${i === step ? 'text-glow-mint' : 'text-slate-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 rounded-full mb-6 ${i < step ? 'bg-accent-green' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-10 overflow-hidden" style={{ background: 'rgba(33, 91, 99, 0.4)', border: '1px solid rgba(170, 255, 199, 0.2)' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-accent-green/10 flex items-center justify-center text-5xl mx-auto mb-8 border border-accent-green/20 animate-float">🎉</div>
                <h2 className="text-3xl font-black text-white mb-4 text-glow">
                  Hoşgeldin, {user?.name?.split(' ')[0] || 'Gezgin'}!
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                  Seni tanımak ve kişiselleştirilmiş bir başlangıç hazırlamak için birkaç hızlı soru soracağız.
                  Sadece <span className="text-glow-mint font-bold">30 saniye</span> sürecek! 🚀
                </p>
                <div className="grid grid-cols-3 gap-4 mb-10 text-center">
                  {[['🎯', 'Hedef', 'Belirle'], ['✅', 'Alışkanlık', 'Seç'], ['📊', 'Takip', 'Başla']].map(([e, l1, l2]) => (
                    <div key={l1} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-3xl mb-2">{e}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-glow-mint">{l1}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{l2}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="btn-primary w-full py-4 text-lg">
                  Hadi Başlayalım! <span className="text-xl ml-2">→</span>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center text-4xl mx-auto mb-6 border border-accent-green/20">🎯</div>
                <h2 className="text-2xl font-black text-white text-center mb-2">Ana hedeflerin neler?</h2>
                <p className="text-slate-400 text-center text-sm mb-8">İstediğin kadar seçebilirsin</p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {GOALS.map((g) => (
                    <button key={g.id} onClick={() => toggleGoal(g.id)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                        goals.includes(g.id) ? 'border-accent-green bg-accent-green/10 shadow-[0_0_20px_rgba(103,192,144,0.15)]' : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}>
                      <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{g.emoji}</div>
                      <div className={`text-sm font-black uppercase tracking-widest ${goals.includes(g.id) ? 'text-glow-mint' : 'text-slate-400'}`}>{g.label}</div>
                      {goals.includes(g.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
                          <span className="text-[10px] text-[#124170] font-black">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(0)} className="flex-1 btn-secondary">GERİ</button>
                  <button onClick={() => setStep(2)} className="flex-[2] btn-primary">DEVAM ET →</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center text-4xl mx-auto mb-6 border border-accent-green/20">✅</div>
                <h2 className="text-2xl font-black text-white text-center mb-2">Başlangıç alışkanlıkların?</h2>
                <p className="text-slate-400 text-center text-sm mb-8">Senin için birkaç önerimiz var</p>
                <div className="grid grid-cols-2 gap-3 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {HABIT_SUGGESTIONS.map((h, i) => (
                    <button key={i} onClick={() => toggleHabit(i)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        selectedHabits.includes(i) ? 'border-accent-green bg-accent-green/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}>
                      <span className="text-2xl">{h.emoji}</span>
                      <span className={`text-xs font-black uppercase tracking-widest flex-1 ${selectedHabits.includes(i) ? 'text-glow-mint' : 'text-slate-400'}`}>{h.label}</span>
                      {selectedHabits.includes(i) && <span className="text-accent-green font-black">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 btn-secondary">GERİ</button>
                  <button onClick={() => setStep(3)} className="flex-[2] btn-primary">DEVAM ET →</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-accent-green/10 flex items-center justify-center text-5xl mx-auto mb-8 border border-accent-green/20 animate-float">🚀</div>
                <h2 className="text-3xl font-black text-white mb-4 text-glow">Her şey hazır!</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  {selectedHabits.length > 0
                    ? `${selectedHabits.length} alışkanlık seçtin. Bunları hesabına ekliyoruz ve serini başlatıyoruz!`
                    : 'Dashboard\'una gidip istediğin zaman alışkanlık ekleyebilirsin.'}
                </p>

                {selectedHabits.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {selectedHabits.map((idx) => (
                      <span key={idx} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-accent-green/10 text-glow-mint border border-accent-green/20">
                        {HABIT_SUGGESTIONS[idx].emoji} {HABIT_SUGGESTIONS[idx].label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-5 rounded-2xl mb-10 text-xs font-bold uppercase tracking-widest leading-loose bg-white/5 text-slate-400 border border-white/10">
                  💡 AI Coach'un sana her an yardımcı olmak için hazır!<br />
                  Sağ alttaki <span className="text-glow-mint">Bot</span> butonuna tıkla.
                </div>

                <button onClick={finish} disabled={loading} className="btn-primary w-full py-4 text-lg">
                  {loading ? 'YÜKLENİYOR...' : 'DASHBOARD\'A GİT! →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip */}
        {step < 3 && (
          <button onClick={() => { localStorage.setItem('onboarding_done', 'true'); navigate('/dashboard') }}
            className="w-full mt-8 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">
            ATLA, SONRA AYARLARIM →
          </button>
        )}
      </div>
    </div>
  )
}
