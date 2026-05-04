import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Zap, Target, TrendingUp, Flame } from 'lucide-react'

function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      duration: Math.random() * 18 + 10,
      delay: Math.random() * 12,
      opacity: Math.random() * 0.45 + 0.1,
      color: i % 3 === 0 ? '6,182,212' : i % 3 === 1 ? '139,92,246' : '16,185,129',
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

const STATS = [
  { icon: Target, label: 'Aktif Alışkanlık', value: '2.4K+', color: '#8B5CF6' },
  { icon: TrendingUp, label: 'Tamamlanma', value: '%89', color: '#06B6D4' },
  { icon: Flame, label: 'Ort. Seri', value: '21 gün', color: '#F59E0B' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex overflow-hidden relative">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full animate-float-slower"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Left decorative panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <ParticleField />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-neon-purple"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-display gradient-text">Streakly</span>
        </div>

        {/* Main copy */}
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="show">
          <div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-bold text-white leading-tight mb-4 font-display"
            >
              Alışkanlıklarını<br />
              <span className="gradient-text">Dönüştür.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Hedeflerine ulaşmak için akıllı takip, derin analizler ve sürekli motivasyon.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}22` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-lg font-bold text-white stat-number">{stat.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="h-px flex-1" style={{
              background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)',
            }} />
          </motion.div>
        </motion.div>

        <p className="text-slate-700 text-xs relative z-10">© 2025 Streakly. Tüm hakları saklıdır.</p>

        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-56 h-56 rounded-tl-[120px] pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), transparent)' }} />
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            className="flex items-center gap-3 mb-8 lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">Streakly</span>
          </motion.div>

          <motion.div
            className="neon-border rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1.5 font-display">Tekrar Hoşgeldin</h2>
              <p className="text-slate-400 text-sm">Hesabına giriş yaparak kaldığın yerden devam et.</p>
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-dark pl-10"
                    placeholder="••••••••"
                  />
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
                    Giriş Yap
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Hesabın yok mu?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Kayıt Ol
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
