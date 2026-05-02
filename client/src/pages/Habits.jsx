import { useState, useEffect } from 'react'
import api from '../services/api'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import LoadingSpinner from '../components/LoadingSpinner'

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
]

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [completionRates, setCompletionRates] = useState({})
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [habitsRes, checkinsRes] = await Promise.all([
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
      ])
      const habits = habitsRes.data
      setHabits(habits)
      setCheckedIds(new Set(checkinsRes.data.map((c) => String(c.habitId))))

      // Fetch monthly completion rate for each habit
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
    } catch (err) {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
      console.error(err)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Alışkanlıklar</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#534AB7] text-white text-sm font-medium rounded-lg hover:bg-[#443c9a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Yeni Alışkanlık</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              filter === value
                ? 'bg-[#EEEDFE] border-[#534AB7] text-[#534AB7]'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
            }`}
          >
            {label}
          </button>
        ))}
        {habits.length > 0 && (
          <span className="ml-auto text-sm text-gray-400 self-center">
            {filtered.length} alışkanlık
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-700 font-medium mb-1">Henüz alışkanlık yok</p>
          <p className="text-gray-400 text-sm mb-5">
            {filter === 'all'
              ? 'İlk alışkanlığını ekleyerek başla'
              : 'Bu kategoride alışkanlık bulunmuyor'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-[#534AB7] text-white text-sm font-medium rounded-lg hover:bg-[#443c9a] transition-colors"
            >
              Alışkanlık Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              checked={checkedIds.has(String(habit._id))}
              onCheck={handleCheck}
              completionRate={completionRates[habit._id] ?? 0}
            />
          ))}
        </div>
      )}

      {showForm && (
        <HabitForm onSave={handleCreate} onClose={() => setShowForm(false)} loading={formLoading} />
      )}
    </div>
  )
}
