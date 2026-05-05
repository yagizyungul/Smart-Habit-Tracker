import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import api from '../services/api'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import LoadingSpinner from '../components/LoadingSpinner'
import PomodoroModal from '../components/PomodoroModal'
import { useDataCache, CACHE_KEYS } from '../context/DataCacheContext'

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Habits() {
  const cache = useDataCache()
  const [habits, setHabits] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [completionRates, setCompletionRates] = useState({})
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [focusHabit, setFocusHabit] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Önce cache'den anında yükle
    const cachedHabits   = cache.get(CACHE_KEYS.HABITS)
    const cachedCheckins = cache.get(CACHE_KEYS.CHECKINS_TODAY)

    if (cachedHabits && cachedCheckins) {
      setHabits(cachedHabits)
      setCheckedIds(new Set(cachedCheckins.map((c) => String(c.habitId))))
      // Tamamlanma oranlarını API'den çek (bunlar çok değişen veriler değil)
      loadCompletionRates(cachedHabits)
      setLoading(false)
    } else {
      loadData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompletionRates = async (habitList) => {
    const rates = {}
    await Promise.allSettled(
      habitList.map(async (habit) => {
        try {
          const res = await api.get(`/api/analytics/habit/${habit._id}`)
          rates[habit._id] = res.data.completionRate ?? 0
        } catch {
          rates[habit._id] = 0
        }
      })
    )
    setCompletionRates(rates)
  }

  const loadData = async () => {
    try {
      const [habitsRes, checkinsRes] = await Promise.all([
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
      ])
      const habits = habitsRes.data
      setHabits(habits)
      setCheckedIds(new Set(checkinsRes.data.map((c) => String(c.habitId))))
      await loadCompletionRates(habits)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async (habitId, isChecked) => {
    if (isChecked) return
    setCheckedIds((prev) => new Set([...prev, habitId]))
    try {
      await api.post('/api/checkins', { habitId, date: today })
      // Cache'deki checkin ve dashboard verilerini tazele
      cache.invalidateMany(CACHE_KEYS.CHECKINS_TODAY, CACHE_KEYS.ANALYTICS_DASHBOARD)
    } catch {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
    }
  }

  const handleCreate = async (form) => {
    setFormLoading(true)
    try {
      await api.post('/api/habits', form)
      setShowForm(false)
      // Habit oluşturulduktan sonra habit + analytics cache'ini tazele, UI'yi güncelle
      const [freshHabits, freshCheckins] = await Promise.all([
        cache.invalidate(CACHE_KEYS.HABITS),
        cache.invalidate(CACHE_KEYS.CHECKINS_TODAY),
      ])
      cache.invalidateMany(CACHE_KEYS.ANALYTICS_DASHBOARD, CACHE_KEYS.ANALYTICS_OVERVIEW)
      if (freshHabits) {
        setHabits(freshHabits)
        loadCompletionRates(freshHabits)
      }
      if (freshCheckins) setCheckedIds(new Set(freshCheckins.map((c) => String(c.habitId))))
    } catch (err) {
      console.error(err)
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = habits.filter((h) => {
    if (filter === 'daily') return h.frequency === 'daily'
    if (filter === 'weekly') return h.frequency === 'weekly'
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white text-glow">Alışkanlıklar</h1>
          <p className="text-sm text-slate-400 mt-1">{habits.length} aktif alışkanlık takip ediliyor</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Yeni Alışkanlık</span>
          <span className="sm:hidden">Ekle</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {FILTERS.map(({ value, label }) => (
          <motion.button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-5 py-2 text-xs font-bold rounded-xl border transition-all duration-300 uppercase tracking-widest ${
              filter === value 
                ? 'bg-accent-green/20 border-accent-green/40 text-glow-mint shadow-[0_0_15px_rgba(103,192,144,0.1)]' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {label}
          </motion.button>
        ))}
        {habits.length > 0 && (
          <span className="ml-auto text-xs font-bold text-slate-500 uppercase tracking-widest opacity-50">
            {filtered.length} Kayıt
          </span>
        )}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glass-card p-16 text-center"
        >
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-accent-green/10 border border-accent-green/20">
            <Target className="w-10 h-10 text-glow-mint animate-float" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {filter === 'all' ? 'Henüz alışkanlık yok' : 'Bu kategoride alışkanlık yok'}
          </h3>
          <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
            {filter === 'all' ? 'Yeni bir alışkanlık ekleyerek değişim yolculuğuna bugün başla.' : 'Farklı bir filtre deneyerek kayıtlarını görebilirsin.'}
          </p>
          {filter === 'all' && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Alışkanlık Oluştur
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((habit) => (
              <motion.div
                key={habit._id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <HabitCard
                  habit={habit}
                  checked={checkedIds.has(String(habit._id))}
                  onCheck={handleCheck}
                  completionRate={completionRates[habit._id] ?? 0}
                  onStartFocus={setFocusHabit}
                  linkedTitles={(habit.linkedHabitIds || [])
                    .map((id) => habits.find((h) => String(h._id) === String(id))?.title)
                    .filter(Boolean)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {showForm && (
        <HabitForm
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
          loading={formLoading}
          allHabits={habits}
        />
      )}

      {focusHabit && (
        <PomodoroModal
          habit={focusHabit}
          onClose={() => setFocusHabit(null)}
          onComplete={async () => {
            const habitId = String(focusHabit._id)
            if (checkedIds.has(habitId)) return
            try {
              await api.post('/api/checkins', { habitId, date: today })
              setCheckedIds((prev) => new Set([...prev, habitId]))
              cache.invalidateMany(CACHE_KEYS.CHECKINS_TODAY, CACHE_KEYS.ANALYTICS_DASHBOARD)
            } catch {}
          }}
        />
      )}
    </motion.div>
  )
}
