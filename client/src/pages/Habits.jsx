import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import api from '../services/api'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import LoadingSpinner from '../components/LoadingSpinner'

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
  const [habits, setHabits] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [completionRates, setCompletionRates] = useState({})
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [habitsRes, checkinsRes] = await Promise.all([
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
      ])
      const habits = habitsRes.data
      setHabits(habits)
      setCheckedIds(new Set(checkinsRes.data.map((c) => String(c.habitId))))

      const rates = {}
      await Promise.allSettled(
        habits.map(async (habit) => {
          try {
            const res = await api.get(`/api/analytics/habit/${habit._id}`)
            rates[habit._id] = res.data.completionRate ?? 0
          } catch {
            rates[habit._id] = 0
          }
        })
      )
      setCompletionRates(rates)
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
      await loadData()
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
          <h1 className="text-2xl font-bold text-white font-display">Alışkanlıklar</h1>
          <p className="text-sm text-slate-500 mt-0.5">{habits.length} alışkanlık takip ediliyor</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary flex-shrink-0 text-sm"
          style={{ padding: '0.5rem 1rem', gap: '0.375rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
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
            className="px-4 py-2 text-sm font-semibold rounded-xl border transition-all"
            style={filter === value ? {
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#A78BFA',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748B',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {label}
          </motion.button>
        ))}
        {habits.length > 0 && (
          <span className="ml-auto text-sm text-slate-600">
            {filtered.length} alışkanlık
          </span>
        )}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-14 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Target className="w-7 h-7 text-violet-400" />
          </div>
          <p className="text-slate-300 font-semibold mb-1.5">
            {filter === 'all' ? 'Henüz alışkanlık yok' : 'Bu kategoride alışkanlık yok'}
          </p>
          <p className="text-slate-600 text-sm mb-6">
            {filter === 'all' ? 'İlk alışkanlığını ekleyerek başla' : 'Farklı bir filtre dene'}
          </p>
          {filter === 'all' && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="w-4 h-4" />
              Alışkanlık Ekle
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
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {showForm && (
        <HabitForm onSave={handleCreate} onClose={() => setShowForm(false)} loading={formLoading} />
      )}
    </motion.div>
  )
}
