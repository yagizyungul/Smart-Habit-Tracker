import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Download, Flame, TrendingUp, Star, Check } from 'lucide-react'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_TOOLTIP = {
  background: 'rgba(14,14,26,0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#E2E8F0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  padding: '8px 12px',
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function StatCard({ label, value, sub, icon: Icon, color, gradient }) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-[0.07] pointer-events-none"
        style={{ background: gradient }} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}18` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="stat-number text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5 truncate">{sub}</div>}
    </motion.div>
  )
}

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

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
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Analitik</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performansının derinlemesine analizi</p>
        </div>
        <motion.button
          onClick={handleExport}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-slate-300 transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.97 }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">CSV İndir</span>
          <span className="sm:hidden">CSV</span>
        </motion.button>
      </motion.div>

      {/* Summary stat cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Bugün"
          value={`${dash?.todayProgress?.completed ?? 0}/${dash?.todayProgress?.total ?? 0}`}
          sub="tamamlandı"
          icon={Check}
          color="#10B981"
          gradient="linear-gradient(135deg, #10B981, #059669)"
        />
        <StatCard
          label="Bu Ay"
          value={`${dash?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          icon={TrendingUp}
          color="#8B5CF6"
          gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${dash?.bestStreak?.streak ?? 0} gün`}
          sub={dash?.bestStreak?.habitTitle || '—'}
          icon={Flame}
          color="#F59E0B"
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
        />
        <StatCard
          label="Mükemmel Gün"
          value={dash?.perfectDays ?? 0}
          sub="son 30 günde"
          icon={Star}
          color="#06B6D4"
          gradient="linear-gradient(135deg, #06B6D4, #0891B2)"
        />
      </motion.div>

      {/* Habit success rates + Monthly trend */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Habit success rates */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-sm font-bold text-slate-200 mb-5">Alışkanlık Başarı Oranları</h2>
          {sortedHabits.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Henüz veri yok</div>
          ) : (
            <div className="space-y-4">
              {sortedHabits.map((h) => {
                const barColor = h.color || '#8B5CF6'
                return (
                  <div key={h.habitId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: barColor, boxShadow: `0 0 5px ${barColor}80` }} />
                        <span className="text-sm text-slate-300 truncate max-w-[180px]">{h.title}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-600">{h.streak} gün seri</span>
                        <span className="text-sm font-bold" style={{ color: barColor }}>{h.completionRate}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${barColor}88, ${barColor})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${h.completionRate}%` }}
                        transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Monthly trend */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-sm font-bold text-slate-200 mb-4">Aylık Trend</h2>
          {overview?.monthlyTrend?.length ? (
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={overview.monthlyTrend} barSize={40} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(v) => [`${v}%`, 'Tamamlanma']}
                  contentStyle={DARK_TOOLTIP}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {overview.monthlyTrend.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === overview.monthlyTrend.length - 1
                        ? 'url(#monthGrad)'
                        : 'rgba(139,92,246,0.22)'}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">Henüz veri yok</div>
          )}
        </motion.div>
      </motion.div>

      {/* Daily last 30 days */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h2 className="text-sm font-bold text-slate-200 mb-4">Son 30 Gün — Günlük Tamamlanma</h2>
        {overview?.dailyLast30?.length ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={overview.dailyLast30} barSize={8} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#475569' }}
                tickFormatter={(d) => {
                  const dt = new Date(d)
                  return `${dt.getDate()}/${dt.getMonth() + 1}`
                }}
                interval={4}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                labelFormatter={(d) => new Date(d).toLocaleDateString('tr-TR')}
                formatter={(v) => [`${v}%`, 'Tamamlanma']}
                contentStyle={DARK_TOOLTIP}
              />
              <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                {(overview.dailyLast30 || []).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pct > 75 ? '#10B981' : entry.pct > 40 ? '#8B5CF6' : 'rgba(255,255,255,0.12)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-600 text-sm">Henüz veri yok</div>
        )}
      </motion.div>

      {/* Heatmap */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h2 className="text-sm font-bold text-slate-200 mb-4">Aktivite Haritası — Son 30 Gün</h2>
        <HeatmapGrid data={overview?.dailyLast30 ?? []} />
      </motion.div>
    </motion.div>
  )
}
