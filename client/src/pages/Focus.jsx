import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Target, Coffee, CheckCircle2, Music, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import api from '../services/api'
import { useDataCache, CACHE_KEYS } from '../context/DataCacheContext'
import { useTheme } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'

const BREAK_MINUTES = 5

const MUSIC_TRACKS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', emoji: '🎧' },
  { id: 'mIYzpCGuIWE', title: 'Klasik Müzik (Odak)', emoji: '🎻' },
  { id: '4xDzrJKXOOY', title: 'Deep Focus (Uzay)', emoji: '🌌' },
]

export default function Focus() {
  const cache = useDataCache()
  const { accent } = useTheme()

  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHabitId, setSelectedHabitId] = useState('')
  
  const [focusDuration, setFocusDuration] = useState(25) // Dakika
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  
  const totalSeconds = mode === 'focus' ? focusDuration * 60 : BREAK_MINUTES * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const [showMusic, setShowMusic] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  
  const intervalRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    let active = true
    const cached = cache.get(CACHE_KEYS.HABITS)
    if (cached) {
      setHabits(cached)
      setLoading(false)
    } else {
      api.get('/api/habits').then(res => {
        if (active) {
          setHabits(res.data)
          setLoading(false)
        }
      }).catch(() => {
        if (active) setLoading(false)
      })
    }
    return () => { active = false }
  }, [cache])

  // Aktif alışkanlıkları filtrele
  const activeHabits = useMemo(() => habits.filter(h => h.isActive), [habits])
  const selectedHabit = useMemo(() => activeHabits.find(h => h._id === selectedHabitId), [activeHabits, selectedHabitId])

  // İlk yüklemede seçili alışkanlık yoksa ilkini seç
  useEffect(() => {
    if (!loading && activeHabits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(activeHabits[0]._id)
    }
  }, [loading, activeHabits, selectedHabitId])

  // focusDuration değiştiğinde sayacı güncelle (eğer çalışmıyorsa)
  useEffect(() => {
    if (!running && mode === 'focus') {
      setSecondsLeft(focusDuration * 60)
    }
  }, [focusDuration, running, mode])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          
          if (mode === 'focus' && !completedRef.current) {
            completedRef.current = true
            handleFocusComplete()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFocusComplete = async () => {
    setSessionCompleted(true)
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [accent.primary, accent.secondary, '#FFFFFF']
    })

    if (!selectedHabitId) return

    try {
      const today = new Date().toISOString().split('T')[0]
      await api.post('/api/checkins/focus', {
        habitId: selectedHabitId,
        date: today,
        focusMinutes: focusDuration
      })
    } catch (err) {
      console.error('Focus save error:', err)
    }
  }

  const switchMode = (nextMode) => {
    clearInterval(intervalRef.current)
    setMode(nextMode)
    setSecondsLeft(nextMode === 'focus' ? focusDuration * 60 : BREAK_MINUTES * 60)
    setRunning(false)
    setSessionCompleted(false)
    if (nextMode === 'focus') completedRef.current = false
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    setSecondsLeft(totalSeconds)
    setRunning(false)
    setSessionCompleted(false)
    if (mode === 'focus') completedRef.current = false
  }

  if (loading) return <LoadingSpinner />

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Target className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-300">Aktif alışkanlık bulunamadı</h2>
        <p className="text-slate-500 mt-2">Odak modunu kullanmak için önce bir alışkanlık oluşturun.</p>
      </div>
    )
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100
  const color = selectedHabit?.color || accent.primary

  const radius = 160
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sol Panel: Alışkanlık Seçimi */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-4">
        <div>
          <h1 className="text-3xl font-black text-white text-glow">Odak Modu</h1>
          <p className="text-sm text-slate-400 mt-1">Pomodoro tekniği ile odaklan ve çalış.</p>
        </div>

        <div className="glass-card p-4 mt-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
            Odaklanılacak Hedef
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {activeHabits.map(habit => (
              <button
                key={habit._id}
                onClick={() => {
                  if (running) return // Çalışırken değiştirmeyi engelle
                  setSelectedHabitId(habit._id)
                }}
                disabled={running}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                  selectedHabitId === habit._id ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={selectedHabitId === habit._id ? { borderLeft: `3px solid ${habit.color || accent.primary}` } : {}}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: habit.color || accent.primary }}
                />
                <span className="text-sm font-medium text-slate-200 truncate">
                  {habit.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Müzik Oynatıcı Paneli */}
        <AnimatePresence>
          {showMusic && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="glass-card mt-4 overflow-hidden"
              style={{ border: `1px solid ${color}40` }}
            >
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-slate-300" />
                  <span className="text-sm font-bold text-slate-200">Arka Plan Müziği</span>
                </div>
                <button onClick={() => setShowMusic(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                  {MUSIC_TRACKS.map((track, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTrack(i)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentTrack === i ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {track.emoji} {track.title}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl overflow-hidden bg-black/50 aspect-video relative">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${MUSIC_TRACKS[currentTrack].id}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sağ Panel: Sayaç */}
      <div className="flex-1 w-full glass-card p-10 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Arkaplan Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000"
          style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        />

        <div className="flex justify-center gap-3 mb-8 relative z-10">
          <button
            onClick={() => switchMode('focus')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
            style={mode === 'focus' ? {
              background: color,
              color: '#0E1A20',
              boxShadow: `0 0 24px ${color}50`,
            } : {
              background: 'rgba(255,255,255,0.05)',
              color: '#94A3B8',
            }}
          >
            <Target className="w-4 h-4" /> Odak
          </button>
          <button
            onClick={() => switchMode('break')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
            style={mode === 'break' ? {
              background: '#3B82F6',
              color: '#fff',
              boxShadow: '0 0 24px rgba(59,130,246,0.5)',
            } : {
              background: 'rgba(255,255,255,0.05)',
              color: '#94A3B8',
            }}
          >
            <Coffee className="w-4 h-4" /> Mola
          </button>
        </div>

        {/* Dairesel Sayaç */}
        <div className="relative flex items-center justify-center mb-10 z-10">
          <svg width="360" height="360" className="transform -rotate-90">
            <circle
              cx="180"
              cy="180"
              r={radius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="180"
              cy="180"
              r={radius}
              stroke={mode === 'focus' ? color : '#3B82F6'}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
              style={{ filter: `drop-shadow(0 0 16px ${mode === 'focus' ? color : '#3B82F6'}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="stat-number text-8xl text-white text-glow tabular-nums tracking-tight">
              {mm}:{ss}
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4">
              {mode === 'focus' ? `${focusDuration} dk odak seansı` : `${BREAK_MINUTES} dk mola`}
            </div>
            
            <AnimatePresence>
              {sessionCompleted && mode === 'focus' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -bottom-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Süre Kaydedildi!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Forest-style Zaman Kaydırıcısı (Sadece Odak Modunda ve Çalışmıyorken) */}
        <AnimatePresence>
          {mode === 'focus' && !running && !sessionCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-sm mb-10 z-10"
            >
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>10 dk</span>
                <span className="text-white">Odak Süresi: {focusDuration} dk</span>
                <span>120 dk</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="120" 
                step="5" 
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} ${((focusDuration - 10) / 110) * 100}%, rgba(255,255,255,0.1) ${((focusDuration - 10) / 110) * 100}%)`,
                  outline: 'none'
                }}
              />
              <style dangerouslySetInnerHTML={{__html: `
                input[type=range]::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #fff;
                  box-shadow: 0 0 10px ${color}80;
                  cursor: pointer;
                  border: 2px solid ${color};
                }
              `}} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-6 z-10 mt-auto">
          <motion.button
            onClick={() => setShowMusic(!showMusic)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              showMusic ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
            whileTap={{ scale: 0.92 }}
            title="Arka Plan Müziği"
          >
            <Music className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            onClick={() => setRunning(!running)}
            className="w-20 h-20 rounded-3xl flex items-center justify-center transition-all"
            style={{
              background: running ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${color}, ${accent.secondary})`,
              boxShadow: running ? 'none' : `0 0 32px ${color}60`,
            }}
            whileTap={{ scale: 0.92 }}
          >
            {running
              ? <Pause className="w-8 h-8 text-white" />
              : <Play className="w-8 h-8 text-[#0E1A20] ml-1.5" />}
          </motion.button>

          <motion.button
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            whileTap={{ scale: 0.92 }}
            title="Sıfırla"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
