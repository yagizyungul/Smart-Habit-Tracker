import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f1f0ff 0%, #e8f5f0 100%)' }}>
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                  style={{ background: i <= step ? '#7F77DD' : '#e2e0f9', color: i <= step ? 'white' : '#94a3b8' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block" style={{ color: i === step ? '#7F77DD' : '#94a3b8' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-0.5 mb-4" style={{ background: i < step ? '#7F77DD' : '#e2e0f9' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Step 0 — Hoşgeldin */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a2e' }}>
                Hoşgeldin, {user?.name?.split(' ')[0] || 'Streakly'} ailesi!
              </h2>
              <p className="mb-6 leading-relaxed" style={{ color: '#64748b' }}>
                Seni tanımak ve kişiselleştirilmiş bir başlangıç hazırlamak için birkaç hızlı soru soracağız.
                Sadece <strong>30 saniye</strong> sürecek! 🚀
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                {[['🎯', 'Hedeflerini', 'belirle'], ['✅', 'Alışkanlıklarını', 'seç'], ['📊', 'Takip etmeye', 'başla']].map(([e, l1, l2]) => (
                  <div key={l1} className="p-3 rounded-2xl" style={{ background: '#f8f7ff' }}>
                    <div className="text-2xl mb-1">{e}</div>
                    <div className="text-xs font-medium" style={{ color: '#7F77DD' }}>{l1}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{l2}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="w-full py-3 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)' }}>
                Hadi Başlayalım! →
              </button>
            </div>
          )}

          {/* Step 1 — Hedefler */}
          {step === 1 && (
            <div>
              <div className="text-4xl mb-3 text-center">🎯</div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1a1a2e' }}>Ana hedeflerin neler?</h2>
              <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>İstediğin kadar seçebilirsin</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {GOALS.map((g) => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className="p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: goals.includes(g.id) ? '#7F77DD' : '#e2e0f9',
                      background: goals.includes(g.id) ? '#f1f0ff' : 'white',
                    }}>
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-sm font-medium" style={{ color: goals.includes(g.id) ? '#7F77DD' : '#1a1a2e' }}>{g.label}</div>
                    {goals.includes(g.id) && <div className="text-xs mt-1" style={{ color: '#7F77DD' }}>✓ Seçildi</div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl border font-medium" style={{ borderColor: '#e2e0f9', color: '#64748b' }}>← Geri</button>
                <button onClick={() => setStep(2)} className="flex-2 px-8 py-3 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)', flex: 2 }}>
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Alışkanlıklar */}
          {step === 2 && (
            <div>
              <div className="text-4xl mb-3 text-center">✅</div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: '#1a1a2e' }}>Hangi alışkanlıklarla başlamak istersin?</h2>
              <p className="text-sm text-center mb-5" style={{ color: '#64748b' }}>Seçtiklerini anında hesabına ekleyeceğiz</p>
              <div className="grid grid-cols-2 gap-2 mb-6 max-h-72 overflow-y-auto pr-1">
                {HABIT_SUGGESTIONS.map((h, i) => (
                  <button key={i} onClick={() => toggleHabit(i)}
                    className="flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: selectedHabits.includes(i) ? h.color : '#e2e0f9',
                      background: selectedHabits.includes(i) ? h.color + '12' : 'white',
                    }}>
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-xs font-medium flex-1" style={{ color: selectedHabits.includes(i) ? h.color : '#1a1a2e' }}>{h.label}</span>
                    {selectedHabits.includes(i) && <span className="text-xs" style={{ color: h.color }}>✓</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mb-4" style={{ color: '#94a3b8' }}>
                {selectedHabits.length} alışkanlık seçildi · Sonradan ekleyip çıkarabilirsin
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border font-medium" style={{ borderColor: '#e2e0f9', color: '#64748b' }}>← Geri</button>
                <button onClick={() => setStep(3)} className="flex-2 px-8 py-3 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)', flex: 2 }}>
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Hazır */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Her şey hazır!</h2>
              <p className="mb-6 leading-relaxed" style={{ color: '#64748b' }}>
                {selectedHabits.length > 0
                  ? `${selectedHabits.length} alışkanlık seçtin. Bunları hesabına ekliyoruz ve takibe başlıyorsun!`
                  : 'Dashboard\'una gidip istediğin zaman alışkanlık ekleyebilirsin.'}
              </p>

              {selectedHabits.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {selectedHabits.map((idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: HABIT_SUGGESTIONS[idx].color + '18', color: HABIT_SUGGESTIONS[idx].color }}>
                      {HABIT_SUGGESTIONS[idx].emoji} {HABIT_SUGGESTIONS[idx].label}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: '#f1f0ff', color: '#7F77DD' }}>
                💡 AI Coach'un sana her an yardımcı olmak için hazır! Sağ alttaki 🎙️ butonuna tıkla.
              </div>

              <button onClick={finish} disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)' }}>
                {loading ? '⏳ Yükleniyor...' : '🎯 Dashboard\'a Git!'}
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        {step < 3 && (
          <button onClick={() => { localStorage.setItem('onboarding_done', 'true'); navigate('/dashboard') }}
            className="w-full mt-4 text-center text-sm" style={{ color: '#94a3b8' }}>
            Atla, sonra ayarlarım →
          </button>
        )}
      </div>
    </div>
  )
}
