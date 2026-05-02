import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold truncate" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [overviewRes, dashRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/dashboard'),
      ])
      setOverview(overviewRes.data)
      setDash(dashRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/api/analytics/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `habits-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />

  const sortedHabits = [...(overview?.habits ?? [])].sort((a, b) => b.completionRate - a.completionRate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
        <button
          onClick={handleExport}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors bg-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">CSV İndir</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Bugün"
          value={`${dash?.todayProgress?.completed ?? 0}/${dash?.todayProgress?.total ?? 0}`}
          sub="tamamlandı"
          color="#1D9E75"
        />
        <StatCard
          label="Bu Ay"
          value={`${dash?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          color="#0B735F"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${dash?.bestStreak?.streak ?? 0} gün`}
          sub={dash?.bestStreak?.habitTitle || '—'}
          color="#F59E0B"
        />
        <StatCard
          label="Mükemmel Gün"
          value={dash?.perfectDays ?? 0}
          sub="son 30 günde"
          color="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit success rates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Alışkanlık Başarı Oranları</h2>
          {sortedHabits.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Henüz veri yok</div>
          ) : (
            <div className="space-y-3.5">
              {sortedHabits.map((h) => (
                <div key={h.habitId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{h.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-400">{h.streak} gün seri</span>
                      <span className="text-sm font-semibold text-gray-700">{h.completionRate}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${h.completionRate}%`, backgroundColor: h.color || '#0B735F' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Aylık Trend</h2>
          {overview?.monthlyTrend?.length ? (
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={overview.monthlyTrend} barSize={44} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  formatter={(v) => [`${v}%`, 'Tamamlanma']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: 'none' }}
                />
                <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
                  {overview.monthlyTrend.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === overview.monthlyTrend.length - 1 ? '#0CDC2A' : '#639D75'}
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

      {/* Daily last 30 days */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Son 30 Gün — Günlük Tamamlanma</h2>
        {overview?.dailyLast30?.length ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={overview.dailyLast30} barSize={9} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#9CA3AF' }}
                tickFormatter={(d) => {
                  const dt = new Date(d)
                  return `${dt.getDate()}/${dt.getMonth() + 1}`
                }}
                interval={4}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                labelFormatter={(d) => new Date(d).toLocaleDateString('tr-TR')}
                formatter={(v) => [`${v}%`, 'Tamamlanma']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: 'none' }}
              />
              <Bar dataKey="pct" fill="#1D9E75" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Henüz veri yok</div>
        )}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Isı Haritası — Son 30 Gün</h2>
        <HeatmapGrid data={overview?.dailyLast30 ?? []} />
      </div>
    </div>
  )
}
