import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Zap, CheckCircle2, Eye, EyeOff } from 'lucide-react'

function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      duration: Math.random() * 18 + 10,
      delay: Math.random() * 12,
      opacity: Math.random() * 0.4 + 0.1,
      color: i % 2 === 0 ? '103,192,144' : '170,255,199',
    })), []
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(${p.color}, ${p.opacity})`,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

const FEATURES = [
  'Alışkanlıklarını günlük takip et',
  'Streak ve analitik raporlar',
  'Otomatik hatırlatıcılar',
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (form.name.trim().length < 2) return 'İsim en az 2 karakter olmalı'
    if (form.password.length < 8) return 'Şifre en az 8 karakter olmalı'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex overflow-hidden relative">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(170,255,199,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(103,192,144,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(170,255,199,0.2)]"
              style={{ background: 'linear-gradient(135deg, #67C090, #AAFFC7)' }}>
              <Zap className="w-6 h-6 text-[#124170]" />
            </div>
            <span className="text-2xl font-black text-white text-glow">Streakly</span>
          </motion.div>

          <motion.div
            className="glass-card p-10 relative overflow-hidden"
            style={{
              background: 'rgba(33, 91, 99, 0.4)',
              boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1.5 font-display">Hesap Oluştur</h2>
              <p className="text-slate-400 text-sm">İlk adımı at, alışkanlıklarını inşa et.</p>
            </div>

            {error && (
              <motion.div
                className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-dark pl-10"
                    placeholder="Adın ve soyadın"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-dark pl-10"
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-dark pl-10 pr-10"
                    placeholder="En az 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Kayıt Ol
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-8">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-glow-mint hover:text-white font-bold transition-all duration-300">
                Giriş Yap
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right decorative panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <ParticleField />

        <div />

        <div className="space-y-8">
          <div>
            <h2 className="text-6xl font-black text-white leading-tight mb-6">
              Başarıya giden<br />
              <span className="text-glow-mint">yol buradan başlar.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Alışkanlıklarını takip et, serileri koru ve her gün biraz daha iyi bir sen ol.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(170,255,199,0.1)' }}>
                  <CheckCircle2 className="w-4 h-4 text-glow-mint" />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs">© 2025 Streakly. Tüm hakları saklıdır.</p>

        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-tr-[120px] pointer-events-none"
          style={{ background: 'linear-gradient(225deg, rgba(16,185,129,0.07), transparent)' }} />
      </motion.div>
    </div>
  )
}
