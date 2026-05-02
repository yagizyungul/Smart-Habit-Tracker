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
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#639D75]">rutin bahçesi</p>
          <h1 className="text-3xl font-black text-[#384166]">Alışkanlıklar</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl bg-[#0B735F] px-4 py-2.5 text-sm font-black text-white shadow-xl shadow-[#0B735F]/20 transition hover:-translate-y-0.5 hover:bg-[#095f50]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Yeni Alışkanlık</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-2xl border px-4 py-2 text-sm font-black transition ${
              filter === value
                ? 'border-[#0B735F] bg-[#0B735F] text-white'
                : 'border-white/70 bg-white/78 text-[#384166] hover:border-[#639D75]/45'
            }`}
          >
            {label}
          </button>
        ))}
        {habits.length > 0 && (
          <span className="ml-auto self-center text-sm font-bold text-[#639D75]">
            {filtered.length} alışkanlık
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-12 text-center shadow-[0_18px_60px_rgba(56,65,102,0.10)] backdrop-blur">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#0CDC2A]/15 text-3xl text-[#0B735F] pulse-sprout">✓</div>
          <p className="mb-1 font-black text-[#384166]">Henüz alışkanlık yok</p>
          <p className="mb-5 text-sm font-semibold text-[#639D75]">
            {filter === 'all' ? 'İlk alışkanlığını ekleyerek başla' : 'Bu kategoride alışkanlık bulunmuyor'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-[#0B735F] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#095f50]"
            >
              Alışkanlık Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
