import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import VoiceCoach from '../VoiceCoach'

function FloatingDashes() {
  const particles = useMemo(() => {
    const palette = [
      '#67C090', '#AAFFC7', '#3B82F6', '#6366F1',
      '#A78BFA', '#34D399', '#60A5FA', '#0EA5E9',
      '#10B981', '#38BDF8', '#818CF8',
    ]
    return Array.from({ length: 45 }, (_, i) => {
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
        op: Math.random() * 0.4 + 0.1,
        color: palette[Math.floor(Math.random() * palette.length)],
      }
    })
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
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

function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.6,
      duration: Math.random() * 20 + 12,
      delay: Math.random() * 15,
      opacity: Math.random() * 0.35 + 0.08,
      color: i % 3 === 0 ? '103,192,144' : i % 3 === 1 ? '170,255,199' : '18,65,112',
    })), []
  )
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen relative selection:bg-glow-mint/30 selection:text-glow-mint"
      style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(33,91,99,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(18,65,112,0.5) 0%, transparent 60%), #070d14' }}
    >
      {/* Animated mesh orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(103,192,144,0.07) 0%, transparent 70%)', animation: 'float 18s ease-in-out infinite' }} />
        <div className="absolute -bottom-64 -right-64 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(33,91,99,0.1) 0%, transparent 70%)', animation: 'float 22s ease-in-out 4s infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(18,65,112,0.08) 0%, transparent 70%)' }} />
      </div>

      <ParticleField />
      <FloatingDashes />

      <Navbar />

      <main className="relative z-10 w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-8 pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.98, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <VoiceCoach />
    </div>
  )
}
