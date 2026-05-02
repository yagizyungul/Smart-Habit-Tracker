import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../services/api'
import HabitForm from '../components/HabitForm'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'

const FREQ_LABELS = { daily: 'Her gün', weekly: 'Haftalık', custom: 'Özel günler' }

function StatCard({ label, value, unit, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}

export default function HabitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [habit, setHabit] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [checkinDates, setCheckinDates] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [habitRes, analyticsRes, checkinsRes] = await Promise.all([
        api.get(`/api/habits/${id}`),
        api.get(`/api/analytics/habit/${id}`),
        api.get(`/api/checkins/habit/${id}`),
      ])
      setHabit(habitRes.data)
      setAnalytics(analyticsRes.data)
      setCheckinDates(checkinsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (form) => {
    setEditLoading(true)
    try {
      await api.put(`/api/habits/${id}`, form)
      setShowEdit(false)
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`"${habit?.title}" alışkanlığını silmek istediğine emin misin?`)) return
    try {
      await api.delete(`/api/habits/${id}`)
      navigate('/habits')
    } catch (err) {
      console.error(err)
    }
  }

  const buildBarData = () => {
    const set = new Set(checkinDates)
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (27 - i))
      const ds = d.toISOString().split('T')[0]
      return {
        label: d.getDate().toString(),
        done: set.has(ds) ? 1 : 0,
        date: ds,
      }
    })
  }

  if (loading) return <LoadingSpinner />
  if (!habit) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Alışkanlık bulunamadı.</p>
        <Link to="/habits" className="text-[#534AB7] font-medium hover:underline">
          ← Alışkanlıklara dön
        </Link>
      </div>
    )
  }

  const barData = buildBarData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/habits" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: habit.color || '#534AB7' }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{habit.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{FREQ_LABELS[habit.frequency] || habit.frequency}</span>
              {habit.description && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-400 truncate max-w-xs">{habit.description}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-8 sm:ml-0">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Düzenle
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-1.5 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Mevcut Seri" value={analytics?.currentStreak ?? 0} unit="gün" color="#F59E0B" />
        <StatCard label="En İyi Seri" value={analytics?.bestStreak ?? 0} unit="gün" color="#1D9E75" />
        <StatCard label="Bu Ay" value={`${analytics?.completionRate ?? 0}%`} color="#534AB7" />
        <StatCard label="Toplam" value={analytics?.completedDays ?? 0} unit="gün" color="#3B82F6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Son 90 Gün</h2>
          <HeatmapGrid dates={checkinDates} days={90} />
        </div>

        {/* Bar chart last 28 days */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Son 28 Gün</h2>
          <ResponsiveContainer width="100%" height={168}>
            <BarChart data={barData} barSize={12} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                interval={6}
              />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                formatter={(v) => [v === 1 ? 'Tamamlandı ✓' : 'Tamamlanmadı', '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: 'none' }}
              />
              <Bar dataKey="done" radius={[3, 3, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.done === 1 ? (habit.color || '#534AB7') : '#E5E7EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showEdit && (
        <HabitForm
          initial={habit}
          onSave={handleEdit}
          onClose={() => setShowEdit(false)}
          loading={editLoading}
        />
      )}
    </div>
  )
}
