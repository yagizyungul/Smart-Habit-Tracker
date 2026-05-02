import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold truncate" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [habits, setHabits] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [analyticsRes, habitsRes, checkinsRes, overviewRes] = await Promise.all([
        api.get('/api/analytics/dashboard'),
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
        api.get('/api/analytics/overview'),
      ])
      setAnalytics(analyticsRes.data)
      setHabits(habitsRes.data)
      setCheckedIds(new Set(checkinsRes.data.map((c) => String(c.habitId))))
      setOverviewData(overviewRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async (habitId) => {
    if (checkedIds.has(habitId)) return
    setCheckedIds((prev) => new Set([...prev, habitId]))
    try {
      await api.post('/api/checkins', { habitId, date: today })
      const res = await api.get('/api/analytics/dashboard')
      setAnalytics(res.data)
    } catch (err) {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />

  const completedToday = checkedIds.size
  const totalToday = habits.length
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Günaydın'
    if (h < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/habits"
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#534AB7] text-white text-sm font-medium rounded-lg hover:bg-[#443c9a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Yeni Alışkanlık</span>
          <span className="sm:hidden">Ekle</span>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Bugün"
          value={`${completedToday}/${totalToday}`}
          sub="tamamlandı"
          color="#1D9E75"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${analytics?.bestStreak?.streak ?? 0} gün`}
          sub={analytics?.bestStreak?.habitTitle || '—'}
          color="#F59E0B"
        />
        <StatCard
          label="Bu Ay"
          value={`${analytics?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          color="#534AB7"
        />
        <StatCard
          label="Mükemmel Gün"
          value={analytics?.perfectDays ?? 0}
          sub="son 30 günde"
          color="#3B82F6"
        />
      </div>

      {/* Today's habits + weekly chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's habits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Bugünkü Alışkanlıklar</h2>
            {totalToday > 0 && (
              <span className="text-xs text-gray-400">
                {completedToday}/{totalToday}
              </span>
            )}
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-gray-400 text-sm mb-3">Henüz alışkanlık yok</p>
              <Link to="/habits" className="text-[#534AB7] text-sm font-medium hover:underline">
                İlk alışkanlığını ekle →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const done = checkedIds.has(String(habit._id))
                return (
                  <div
                    key={habit._id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${done ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <button
                      onClick={() => handleCheckin(String(habit._id))}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-300 hover:border-[#1D9E75]'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm font-medium min-w-0 truncate ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                    >
                      {habit.title}
                    </span>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || '#534AB7' }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Weekly bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Bu Hafta</h2>
          {analytics?.weeklyData?.length ? (
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={analytics.weeklyData} barSize={30} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  formatter={(v) => [`${v}%`, 'Tamamlanma']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: 'none' }}
                />
                <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
                  {analytics.weeklyData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === analytics.weeklyData.length - 1 ? '#534AB7' : '#C4C1F0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Henüz veri yok</div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Son 30 Gün — Isı Haritası</h2>
        <HeatmapGrid data={overviewData?.dailyLast30 ?? []} />
      </div>
    </div>
  )
}
