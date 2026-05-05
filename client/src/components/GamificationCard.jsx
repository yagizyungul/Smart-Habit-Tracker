import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Sparkles, Lock } from 'lucide-react'
import confetti from 'canvas-confetti'
import api from '../services/api'

export default function GamificationCard() {
  const [data, setData] = useState(null)
  const [showAllBadges, setShowAllBadges] = useState(false)
  const prevLevelRef = useRef(null)

  useEffect(() => {
    let active = true
    api.get('/api/gamification/profile')
      .then((res) => { 
        if (!active) return
        
        // Seviye atlama kontrolü ve konfeti
        if (prevLevelRef.current !== null && res.data.level > prevLevelRef.current) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#67C090', '#AAFFC7', '#FCD34D']
          })
        }
        prevLevelRef.current = res.data.level
        setData(res.data) 
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (!data) {
    return (
      <div className="glass-card p-5 h-full">
        <div className="h-6 w-32 bg-white/5 rounded mb-4 animate-pulse" />
        <div className="h-3 w-full bg-white/5 rounded mb-3 animate-pulse" />
        <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }

  const unlockedCount = data.badges.filter((b) => b.unlocked).length
  const visibleBadges = showAllBadges ? data.badges : data.badges.slice(0, 6)

  return (
    <motion.div
      className="glass-card p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="absolute -top-16 -right-16 w-40 h-40 blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, var(--glow-mint), transparent 70%)' }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-glow-mint" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seviye {data.level}</span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">{data.levelTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.nextLevelTitle ? `Sıradaki: ${data.nextLevelTitle}` : 'Maksimum seviye 🎉'}
          </p>
        </div>
        <div className="text-right">
          <div className="stat-number text-2xl text-glow-mint">{data.xp}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">XP</div>
        </div>
      </div>

      <div className="mb-4 relative">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-semibold">
          <span>{data.currentThreshold} XP</span>
          <span>{data.xpToNext > 0 ? `${data.xpToNext} XP kaldı` : 'Maks.'}</span>
          <span>{data.nextThreshold} XP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(to right, var(--accent-green), var(--glow-mint))' }}
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-base font-bold text-glow-mint">{data.stats.totalCheckins}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Check-in</div>
        </div>
        <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-base font-bold text-glow-mint">{data.stats.bestStreakOverall}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">En İyi</div>
        </div>
        <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-base font-bold text-glow-mint">{unlockedCount}/{data.badges.length}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Rozet</div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Rozetler
          </span>
          {data.badges.length > 6 && (
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-glow-mint transition-colors"
            >
              {showAllBadges ? 'Gizle' : `+${data.badges.length - 6} daha`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {visibleBadges.map((b) => (
            <div
              key={b.key}
              className="aspect-square rounded-xl flex flex-col items-center justify-center text-center transition-all"
              style={{
                background: b.unlocked ? 'rgba(170,255,199,0.08)' : 'rgba(255,255,255,0.02)',
                border: b.unlocked ? '1px solid rgba(170,255,199,0.25)' : '1px solid rgba(255,255,255,0.05)',
                opacity: b.unlocked ? 1 : 0.45,
              }}
              title={`${b.title} — ${b.desc}`}
            >
              {b.unlocked ? (
                <span className="text-xl leading-none">{b.icon}</span>
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="text-[8px] mt-0.5 font-bold text-slate-400 uppercase tracking-tight px-1 truncate w-full">
                {b.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
