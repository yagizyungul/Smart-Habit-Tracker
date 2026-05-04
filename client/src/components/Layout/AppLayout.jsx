import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import VoiceCoach from '../VoiceCoach'

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

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
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
