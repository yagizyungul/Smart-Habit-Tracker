import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react'

const HERO_LINES = [
  { top: 'Alışkanlıklarını', bottom: 'Takip Et.' },
  { top: 'Hedeflerine', bottom: 'Ulaş.' },
  { top: 'Serileri', bottom: 'Kır.' },
  { top: 'Değişimi', bottom: 'Başlat.' },
  { top: 'Kendinle', bottom: 'Yarış.' },
]

/* ─── Particle Background ─── */
function ParticleField() {
  const pts = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.8 + 0.7,
    dur: Math.random() * 20 + 12,
    delay: Math.random() * 14,
    op: Math.random() * 0.38 + 0.07,
    col: i % 3 === 0 ? '103,192,144' : i % 3 === 1 ? '170,255,199' : '33,91,99',
  })), [])
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pts.map(p => (
        <div key={p.id} style={{
          position: 'absolute', borderRadius: '50%',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: `rgba(${p.col},${p.op})`,
          animation: `floatParticle ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

/* ─── Antigravity-style Floating Dashes (right panel) ─── */
function FloatingDashes() {
  const particles = useMemo(() => {
    const palette = [
      '#67C090', '#AAFFC7', '#3B82F6', '#6366F1',
      '#A78BFA', '#34D399', '#60A5FA', '#0EA5E9',
      '#10B981', '#38BDF8', '#818CF8',
    ]
    return Array.from({ length: 75 }, (_, i) => {
      const isCircle = i % 5 === 0
      const sz = isCircle ? Math.random() * 4 + 2 : null
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        w: isCircle ? sz : Math.random() * 13 + 5,
        h: isCircle ? sz : 2.2 + Math.random() * 1.2,
        isCircle,
        angle: Math.random() * 360,
        dur: Math.random() * 18 + 8,
        delay: -(Math.random() * 28),
        op: Math.random() * 0.52 + 0.15,
        color: palette[Math.floor(Math.random() * palette.length)],
      }
    })
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          transform: `rotate(${p.angle}deg)`,
        }}>
          <div style={{
            width: p.w,
            height: p.h,
            borderRadius: p.isCircle ? '50%' : p.h / 2,
            background: p.color,
            opacity: p.op,
            animation: `floatParticle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}/>
        </div>
      ))}
    </div>
  )
}

/* ─── Phone Status Bar ─── */
function StatusBar() {
  return (
    <div style={{
      position: 'absolute', top: 17, left: 22, right: 22,
      zIndex: 25, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', pointerEvents: 'none',
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.2 }}>
          {[3, 5, 7, 9].map((h, i) => (
            <div key={i} style={{ width: 2.2, height: h, background: 'rgba(255,255,255,0.9)', borderRadius: 0.5 }} />
          ))}
        </div>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 19, height: 9, borderRadius: 2, border: '1.2px solid rgba(255,255,255,0.65)', padding: 1.5, position: 'relative' }}>
            <div style={{ width: '72%', height: '100%', background: '#fff', borderRadius: 0.5 }} />
          </div>
          <div style={{ width: 1.5, height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: 0.5 }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Dashboard Screen ─── */
function DashboardScreen() {
  const habits = [
    { name: 'Sabah Meditasyonu', done: true,  color: '#67C090', emoji: '🧘' },
    { name: 'Koşu 5km',          done: true,  color: '#AAFFC7', emoji: '🏃' },
    { name: 'Kitap Okuma',        done: true,  color: '#A78BFA', emoji: '📚' },
    { name: 'Su İçmek (2L)',      done: false, color: '#60A5FA', emoji: '💧' },
    { name: 'Yoga Seansı',        done: false, color: '#F59E0B', emoji: '🌿' },
  ]
  const done = habits.filter(h => h.done).length
  const r = 22, circ = 2 * Math.PI * r

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07071a' }}>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 15px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div>
            <p style={{ fontSize: 6, color: '#4b5563', letterSpacing: 1, textTransform: 'uppercase' }}>Pazartesi, 4 Mayıs</p>
            <p style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>Bugün</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 9px', borderRadius: 20, background: 'rgba(103,192,144,0.16)', border: '1px solid rgba(103,192,144,0.38)' }}>
            <span style={{ fontSize: 11 }}>🔥</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#AAFFC7' }}>28</span>
          </div>
        </div>

        {/* Progress ring card */}
        <div style={{ borderRadius: 16, padding: '11px 13px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 11, background: 'linear-gradient(135deg, rgba(33,91,99,0.92), rgba(18,65,112,0.88))', border: '1px solid rgba(170,255,199,0.22)', boxShadow: '0 0 24px rgba(103,192,144,0.09)' }}>
          <div style={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
            <svg viewBox="0 0 50 50" style={{ width: 50, height: 50, transform: 'rotate(-90deg)' }}>
              <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4.5"/>
              <circle cx="25" cy="25" r={r} fill="none" stroke="url(#g1)" strokeWidth="4.5"
                strokeDasharray={`${circ * done / habits.length} ${circ}`} strokeLinecap="round"/>
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#67C090"/><stop offset="100%" stopColor="#AAFFC7"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10.5, fontWeight: 900, color: '#AAFFC7', lineHeight: 1 }}>{done}/{habits.length}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Günlük İlerleme</p>
            <p style={{ fontSize: 6.5, color: '#94a3b8', marginBottom: 6 }}>{done} alışkanlık tamamlandı</p>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${(done/habits.length)*100}%`, background: 'linear-gradient(to right, #67C090, #AAFFC7)' }}/>
            </div>
          </div>
        </div>

        {/* Habit list */}
        <p style={{ fontSize: 6, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 }}>Alışkanlıklar</p>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {habits.map(h => (
            <div key={h.emoji} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5.5px 8px', borderRadius: 10, background: h.done ? `${h.color}0d` : 'rgba(255,255,255,0.02)', border: `1px solid ${h.done ? h.color + '38' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ width: 14, height: 14, borderRadius: 4.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h.done ? h.color : 'transparent', border: h.done ? 'none' : `1.5px solid ${h.color}50`, boxShadow: h.done ? `0 0 6px ${h.color}55` : 'none' }}>
                {h.done && <span style={{ fontSize: 7, color: '#07071a', fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 9 }}>{h.emoji}</span>
              <span style={{ fontSize: 7.5, flex: 1, color: h.done ? '#374151' : '#cbd5e1', textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '7px 13px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0', borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ e: '🏠', a: true }, { e: '🎯' }, { e: '📊' }, { e: '✨' }].map((item, i) => (
            <div key={i} style={{ width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: item.a ? 'rgba(103,192,144,0.28)' : 'transparent' }}>
              <span style={{ fontSize: 12 }}>{item.e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Analytics Screen ─── */
function AnalyticsScreen() {
  const bars = [38, 62, 55, 88, 50, 79, 96]
  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa']
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07071a' }}>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 15px 0' }}>
        <p style={{ fontSize: 6, color: '#374151', textTransform: 'uppercase', letterSpacing: 1.2 }}>Haftalık Özet</p>
        <p style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 11 }}>Analitik</p>

        {/* Big stat card */}
        <div style={{ borderRadius: 18, padding: '16px 14px', marginBottom: 10, textAlign: 'center', background: 'linear-gradient(145deg, rgba(33,91,99,0.97), rgba(18,65,112,0.95))', border: '1px solid rgba(170,255,199,0.32)', boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(170,255,199,0.08)' }}>
          <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1, color: '#AAFFC7', marginBottom: 4, textShadow: '0 0 30px rgba(170,255,199,0.75), 0 0 70px rgba(103,192,144,0.45)' }}>
            94%
          </div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Başarı Oranı</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
            <div style={{ textAlign: 'center', padding: '0 14px' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#67C090' }}>28</div>
              <div style={{ fontSize: 6, color: '#4b5563' }}>Gün Serisi</div>
            </div>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }}/>
            <div style={{ textAlign: 'center', padding: '0 14px' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#AAFFC7' }}>142</div>
              <div style={{ fontSize: 6, color: '#4b5563' }}>Tamamlanan</div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ borderRadius: 14, padding: '10px 10px 7px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
          <p style={{ fontSize: 6, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 9 }}>Bu Hafta</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                <div style={{ width: '100%', borderRadius: 3.5, height: Math.round(h * 0.62), background: i === 6 ? 'linear-gradient(to top, #67C090, #AAFFC7)' : `rgba(103,192,144,${0.18 + i * 0.09})`, boxShadow: i === 6 ? '0 0 12px rgba(170,255,199,0.55)' : 'none' }}/>
                <span style={{ fontSize: 5.5, color: i === 6 ? '#67C090' : '#374151' }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '7px 13px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0', borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ e: '🏠' }, { e: '🎯' }, { e: '📊', a: true }, { e: '✨' }].map((item, i) => (
            <div key={i} style={{ width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: item.a ? 'rgba(103,192,144,0.28)' : 'transparent' }}>
              <span style={{ fontSize: 12 }}>{item.e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Ultra-Realistic iPhone Mockup ─── */
function PhoneMockup({ children, glowColor = 'rgba(103,192,144,0.32)' }) {
  return (
    <div style={{ position: 'relative', width: 258, height: 528 }}>
      {/* Outer titanium frame */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 52,
        background: 'linear-gradient(160deg, #3e3e54 0%, #2c2c40 28%, #1d1d2e 68%, #131322 100%)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.2)',
          '0 0 0 3.5px rgba(0,0,0,0.94)',
          '0 70px 130px rgba(0,0,0,0.85)',
          '0 30px 70px rgba(0,0,0,0.55)',
          '0 8px 24px rgba(0,0,0,0.4)',
          'inset 0 1px 0 rgba(255,255,255,0.12)',
          'inset 0 -1px 0 rgba(0,0,0,0.45)',
        ].join(', '),
      }}>
        {/* Screen glass */}
        <div style={{
          position: 'absolute', inset: 3.5,
          borderRadius: 48.5,
          overflow: 'hidden',
          background: '#000',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}>
          {children}
          {/* Diagonal glare */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 38%, transparent 62%)' }}/>
          {/* Screen vignette */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 32px rgba(0,0,0,0.45)' }}/>
        </div>

        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)',
          width: 108, height: 28,
          background: '#000', borderRadius: 14, zIndex: 20,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 3px 14px rgba(0,0,0,0.95)',
        }}/>

        {/* Frame top highlight arc */}
        <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.38), transparent)', borderRadius: '50%' }}/>
        {/* Frame bottom edge */}
        <div style={{ position: 'absolute', bottom: 0, left: '22%', right: '22%', height: 1, background: 'rgba(255,255,255,0.05)' }}/>
      </div>

      {/* Right power button */}
      <div style={{ position: 'absolute', right: -3.5, top: 136, width: 4, height: 76, borderRadius: '2.5px 0 0 2.5px', background: 'linear-gradient(180deg, #3c3c52, #252538)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.3), -1px 0 5px rgba(0,0,0,0.7)' }}/>

      {/* Left mute switch */}
      <div style={{ position: 'absolute', left: -3.5, top: 94, width: 4, height: 30, borderRadius: '0 2.5px 2.5px 0', background: 'linear-gradient(180deg, #3c3c52, #252538)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 1px 0 5px rgba(0,0,0,0.7)' }}/>
      {/* Left volume up */}
      <div style={{ position: 'absolute', left: -3.5, top: 140, width: 4, height: 52, borderRadius: '0 2.5px 2.5px 0', background: 'linear-gradient(180deg, #3c3c52, #252538)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 1px 0 5px rgba(0,0,0,0.7)' }}/>
      {/* Left volume down */}
      <div style={{ position: 'absolute', left: -3.5, top: 205, width: 4, height: 52, borderRadius: '0 2.5px 2.5px 0', background: 'linear-gradient(180deg, #3c3c52, #252538)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 1px 0 5px rgba(0,0,0,0.7)' }}/>

      {/* Bottom: speakers + USB-C */}
      <div style={{ position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)', width: '68%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.11)' }}/>)}
        </div>
        <div style={{ width: 40, height: 8, borderRadius: 4, background: 'linear-gradient(180deg, #0a0a16, #121220)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.95)' }}/>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.11)' }}/>)}
        </div>
      </div>

      {/* Ambient glow beneath */}
      <div style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 60, filter: 'blur(28px)', background: glowColor, pointerEvents: 'none' }}/>
    </div>
  )
}

/* ─── Login Form Variants ─── */
const formV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.09 } } }
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } } }

/* ─── Main Component ─── */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % HERO_LINES.length), 3500)
    return () => clearInterval(t)
  }, [])

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
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: '#07071a' }}>
      {/* ── Global background blobs ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,91,99,0.22) 0%, transparent 70%)', filter: 'blur(50px)' }}/>
        <div style={{ position: 'absolute', bottom: '-10%', left: '30%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(103,192,144,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }}/>
        <div style={{ position: 'absolute', top: '35%', right: '0', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(18,65,112,0.3) 0%, transparent 70%)', filter: 'blur(35px)' }}/>
      </div>

      {/* ══════════════════════════ LEFT PANEL ══════════════════════════ */}
      <motion.div
        style={{ flexDirection: 'column', width: '50%', position: 'relative', zIndex: 10, overflow: 'hidden', background: 'linear-gradient(155deg, rgba(18,65,112,0.32) 0%, rgba(33,91,99,0.18) 60%, rgba(7,7,26,0.08) 100%)' }}
        className="hidden lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        <ParticleField />

        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.018, backgroundImage: 'linear-gradient(rgba(170,255,199,1) 1px, transparent 1px), linear-gradient(90deg, rgba(170,255,199,1) 1px, transparent 1px)', backgroundSize: '44px 44px' }}/>

        {/* Smooth gradient transition to the right panel */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', background: 'linear-gradient(to right, transparent, #07071a)', zIndex: 1, pointerEvents: 'none' }}/>

        {/* Top section: logo + headline */}
        <div style={{ position: 'relative', zIndex: 10, padding: '42px 52px 0' }}>
          {/* Logo */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease: 'easeOut' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #67C090, #AAFFC7)', boxShadow: '0 0 24px rgba(170,255,199,0.38)' }}>
              <Zap style={{ width: 20, height: 20, color: '#124170' }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(170,255,199,0.3)' }}>Streakly</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.72, ease: 'easeOut' }}
          >
            {/* Cycling headline — slot-machine vertical slide */}
            <div style={{ position: 'relative', height: 108, overflow: 'hidden', marginBottom: 14 }}>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={lineIdx}
                  style={{ position: 'absolute', width: '100%', fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.025em', margin: 0 }}
                  initial={{ x: 100, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ x: -100, opacity: 0, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {HERO_LINES[lineIdx].top}<br />
                  <span style={{ color: '#AAFFC7', textShadow: '0 0 28px rgba(170,255,199,0.5)' }}>
                    {HERO_LINES[lineIdx].bottom}
                  </span>
                </motion.h1>
              </AnimatePresence>
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, maxWidth: 300 }}>
              Her gün bir adım daha ileri. Güçlü seriler oluştur, hedeflerini gerçeğe dönüştür.
            </p>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 22 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: 'easeOut' }}
          >
            {[
              { icon: '🔥', label: 'Seri Takibi' },
              { icon: '📊', label: 'Anlık Analitik' },
              { icon: '✨', label: 'Akıllı Bildirim' },
            ].map(f => (
              <div key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 11 }}>{f.icon}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.6 }}
          >
            <div style={{ display: 'flex' }}>
              {['#67C090', '#A78BFA', '#60A5FA', '#F59E0B'].map((c, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${c}, ${c}bb)`, border: '2px solid #07071a', marginLeft: i === 0 ? 0 : -8, boxShadow: `0 0 8px ${c}55` }}/>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>2,000+</span> kullanıcı hedeflerine ulaşıyor
            </p>
          </motion.div>
        </div>

        {/* Phones area */}
        <div style={{ flex: 1, position: 'relative', zIndex: 10 }}>
          {/* Ground glow horizon - Radial to prevent sharp horizontal cutoffs */}
          <div style={{ position: 'absolute', bottom: 0, left: '5%', right: '5%', height: 1, background: 'radial-gradient(ellipse at center, rgba(103,192,144,0.3) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: 150, background: 'radial-gradient(ellipse at bottom, rgba(103,192,144,0.08) 0%, transparent 65%)', pointerEvents: 'none' }}/>

          {/* ─── PHONE BACK (Analytics) ─── */}
          <div style={{ position: 'absolute', bottom: -35, left: 'calc(50% - 218px)', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 480, rotate: -18 }}
              animate={{ opacity: 0.9, y: 0, rotate: -13 }}
              transition={{ delay: 0.3, duration: 1.85, ease: [0.12, 1, 0.3, 1] }}
            >
              <motion.div
                animate={{ y: [0, -13, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }}
              >
                <div style={{ transform: 'scale(0.88)', transformOrigin: 'bottom center' }}>
                  <PhoneMockup glowColor="rgba(33,91,99,0.5)">
                    <AnalyticsScreen />
                  </PhoneMockup>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ─── PHONE FRONT (Dashboard) ─── */}
          <div style={{ position: 'absolute', bottom: -35, left: 'calc(50% - 50px)', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 560, rotate: 14 }}
              animate={{ opacity: 1, y: 0, rotate: 8 }}
              transition={{ delay: 0.65, duration: 1.85, ease: [0.12, 1, 0.3, 1] }}
            >
              <motion.div
                animate={{ y: [0, -17, 0] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 3.2 }}
              >
                <PhoneMockup glowColor="rgba(103,192,144,0.34)">
                  <DashboardScreen />
                </PhoneMockup>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <p style={{ color: '#334155', fontSize: 10.5, padding: '18px 52px', position: 'relative', zIndex: 10 }}>© 2025 Streakly. Tüm hakları saklıdır.</p>
      </motion.div>

      {/* ══════════════════════════ RIGHT PANEL ══════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 40px', position: 'relative', zIndex: 10, overflow: 'hidden' }}>

        {/* ── Right panel background ── */}

        {/* Antigravity-style floating dashes */}
        <FloatingDashes />

        {/* Subtle depth vignette — darkens edges, brightens center where form lives */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, rgba(7,7,26,0.55) 100%)' }}/>

        {/* Very soft teal depth orb bottom-left */}
        <div style={{ position: 'absolute', bottom: '-12%', left: '-8%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,91,99,0.2) 0%, transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none' }}/>

        {/* Content */}
        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
          {/* Mobile logo */}
          <motion.div
            className="lg:hidden flex"
            style={{ alignItems: 'center', gap: 12, marginBottom: 36 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #67C090, #AAFFC7)' }}>
              <Zap style={{ width: 20, height: 20, color: '#124170' }}/>
            </div>
            <span className="text-xl font-black text-white text-glow">Streakly</span>
          </motion.div>

          <motion.div
            style={{ padding: 40, position: 'relative', overflow: 'hidden', borderRadius: 24, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'linear-gradient(145deg, rgba(12,22,42,0.72) 0%, rgba(20,38,60,0.65) 50%, rgba(10,28,38,0.72) 100%)', boxShadow: '0 30px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(170,255,199,0.14), inset 0 1px 0 rgba(170,255,199,0.07)' }}
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease: 'easeOut' }}
          >
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(170,255,199,0.6), transparent)' }}/>

            {/* Corner brackets — sci-fi tech look */}
            {[
              { top: 0, left: 0, borderTop: '1.5px solid rgba(170,255,199,0.35)', borderLeft: '1.5px solid rgba(170,255,199,0.35)', borderRadius: '4px 0 0 0' },
              { top: 0, right: 0, borderTop: '1.5px solid rgba(170,255,199,0.35)', borderRight: '1.5px solid rgba(170,255,199,0.35)', borderRadius: '0 4px 0 0' },
              { bottom: 0, left: 0, borderBottom: '1.5px solid rgba(170,255,199,0.35)', borderLeft: '1.5px solid rgba(170,255,199,0.35)', borderRadius: '0 0 0 4px' },
              { bottom: 0, right: 0, borderBottom: '1.5px solid rgba(170,255,199,0.35)', borderRight: '1.5px solid rgba(170,255,199,0.35)', borderRadius: '0 0 4px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 18, height: 18, ...s }}/>
            ))}

            <motion.div variants={formV} initial="hidden" animate="show">
              <motion.div variants={itemV} style={{ marginBottom: 28 }}>
                {/* Streakly mini badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(103,192,144,0.1)', border: '1px solid rgba(103,192,144,0.25)', marginBottom: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#67C090', boxShadow: '0 0 6px rgba(103,192,144,0.8)' }}/>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#67C090', letterSpacing: 1, textTransform: 'uppercase' }}>Streakly</span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>Hesabına Giriş Yap</h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>E-posta ve şifrenle birkaç saniyede içeri gir.</p>
              </motion.div>

              {error && (
                <motion.div
                  style={{ marginBottom: 20, padding: '14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0 }}/>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <motion.div variants={itemV}>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest" style={{ marginBottom: 6 }}>E-posta</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#475569', pointerEvents: 'none' }}/>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-dark" style={{ paddingLeft: 42 }} placeholder="ornek@mail.com"/>
                  </div>
                </motion.div>

                <motion.div variants={itemV}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Şifre</label>
                    <span style={{ fontSize: 11, color: '#67C090', fontWeight: 600, cursor: 'pointer', opacity: 0.8 }}>Şifremi Unuttum?</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#475569', pointerEvents: 'none' }}/>
                    <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-dark" style={{ paddingLeft: 42 }} placeholder="••••••••"/>
                  </div>
                </motion.div>

                <motion.button
                  variants={itemV}
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 4 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  {loading
                    ? <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}/>
                    : <><span>Giriş Yap</span><ArrowRight style={{ width: 16, height: 16 }}/></>
                  }
                </motion.button>
              </form>

              <motion.p variants={itemV} style={{ textAlign: 'center', color: '#475569', fontSize: 14, marginTop: 28 }}>
                Hesabın yok mu?{' '}
                <Link to="/register" className="text-glow-mint hover:text-white font-bold transition-all duration-300">
                  Kayıt Ol
                </Link>
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
