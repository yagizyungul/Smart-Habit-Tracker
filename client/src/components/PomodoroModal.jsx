import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, RotateCcw, X, Coffee, Target } from 'lucide-react'

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

export default function PomodoroModal({ habit, onClose, onComplete }) {
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [running, setRunning] = useState(true)
  const [completedFocus, setCompletedFocus] = useState(false)
  const intervalRef = useRef(null)
  const completedRef = useRef(false)

  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
  const color = habit?.color || '#67C090'

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          if (mode === 'focus' && !completedRef.current) {
            completedRef.current = true
            setCompletedFocus(true)
            onComplete?.()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running, mode, onComplete])

  const switchMode = (next) => {
    clearInterval(intervalRef.current)
    setMode(next)
    setSecondsLeft(next === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
    setRunning(true)
    if (next === 'focus') completedRef.current = false
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setSecondsLeft(total)
    setRunning(false)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progress = ((total - secondsLeft) / total) * 100
  const radius = 130
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          style={{
            background: 'rgba(14,16,28,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `0 0 80px ${color}30`,
          }}
        >
          <div
            className="absolute -top-32 -right-32 w-72 h-72 blur-3xl"
            style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
          />

          <div className="flex items-center justify-between mb-6 relative">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Odak Modu</p>
              <h2 className="text-lg font-bold text-white truncate max-w-[260px]">{habit?.title || 'Pomodoro'}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mb-8 relative">
            <button
              onClick={() => switchMode('focus')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={mode === 'focus' ? {
                background: color,
                color: '#0E1A20',
                boxShadow: `0 0 18px ${color}50`,
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: '#94A3B8',
              }}
            >
              <Target className="w-3 h-3" /> Odak
            </button>
            <button
              onClick={() => switchMode('break')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={mode === 'break' ? {
                background: '#3B82F6',
                color: '#fff',
                boxShadow: '0 0 18px rgba(59,130,246,0.5)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: '#94A3B8',
              }}
            >
              <Coffee className="w-3 h-3" /> Mola
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <svg width="300" height="300" className="transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                fill="none"
              />
              <motion.circle
                cx="150"
                cy="150"
                r={radius}
                stroke={mode === 'focus' ? color : '#3B82F6'}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{ filter: `drop-shadow(0 0 12px ${mode === 'focus' ? color : '#3B82F6'}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="stat-number text-6xl text-white text-glow tabular-nums">
                {mm}:{ss}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                {mode === 'focus' ? '25 dk odak seansı' : '5 dk mola'}
              </div>
              {completedFocus && mode === 'focus' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                  ✓ Check-in eklendi
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-3 relative">
            <motion.button
              onClick={reset}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              whileTap={{ scale: 0.92 }}
              title="Sıfırla"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setRunning(!running)}
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: running ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${color}, var(--glow-mint))`,
                boxShadow: running ? 'none' : `0 0 28px ${color}60`,
              }}
              whileTap={{ scale: 0.92 }}
            >
              {running
                ? <Pause className="w-7 h-7 text-white" />
                : <Play className="w-7 h-7 text-[#0E1A20] ml-1" />}
            </motion.button>
            <div className="w-12" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
