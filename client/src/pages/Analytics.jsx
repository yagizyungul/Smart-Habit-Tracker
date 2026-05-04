import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Download, Flame, TrendingUp, Star, Check } from 'lucide-react'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { useDataCache, CACHE_KEYS } from '../context/DataCacheContext'

const DARK_TOOLTIP = {
  background: 'rgba(18, 65, 112, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(170, 255, 199, 0.2)',
  borderRadius: '16px',
  fontSize: '13px',
  color: '#F8FAFC',
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  padding: '12px 16px',
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card glass-card-hover relative p-6 overflow-hidden"
    >
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20"
        style={{ background: color }} 
      />
      <div 
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="stat-number text-3xl mb-1 text-glow" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-1 font-medium italic">{sub}</div>}
    </motion.div>
  )
}

export default function Analytics() {
  const cache = useDataCache()
  const [overview, setOverview] = useState(null)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Önce cache'den anında yükle
    const cachedOverview = cache.get(CACHE_KEYS.ANALYTICS_OVERVIEW)
    const cachedDash     = cache.get(CACHE_KEYS.ANALYTICS_DASHBOARD)

    if (cachedOverview && cachedDash) {
      setOverview(cachedOverview)
      setDash(cachedDash)
      setLoading(false)
    } else {
      loadData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          <h1 className="text-3xl font-black text-white text-glow">Analitik</h1>
          <p className="text-sm text-slate-400 mt-1">Performansının derinlemesine analizi</p>
        </div>
        <motion.button
          onClick={handleExport}
          className="btn-secondary text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">CSV İndir</span>
          <span className="sm:hidden">CSV</span>
        </motion.button>
      </motion.div>

      {/* Summary stat cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bugün"
          value={`${dash?.todayProgress?.completed ?? 0}/${dash?.todayProgress?.total ?? 0}`}
          sub="tamamlandı"
          icon={Check}
          color="#AAFFC7"
        />
        <StatCard
          label="Bu Ay"
          value={`${dash?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          icon={TrendingUp}
          color="#67C090"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${dash?.bestStreak?.streak ?? 0} gün`}
          sub={dash?.bestStreak?.habitTitle || '—'}
          icon={Flame}
          color="#AAFFC7"
        />
        <StatCard
          label="Mükemmel Gün"
          value={dash?.perfectDays ?? 0}
          sub="son 30 günde"
          icon={Star}
          color="#67C090"
        />
      </motion.div>

      {/* Habit success rates + Monthly trend */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Habit success rates */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6"
        >
          <h2 className="text-base font-bold text-slate-100 mb-6">Alışkanlık Başarı Oranları</h2>
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
                    <div className="h-2 rounded-full overflow-hidden bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${barColor}88, ${barColor})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${h.completionRate}%` }}
                        transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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
          className="glass-card p-6"
        >
          <h2 className="text-base font-bold text-slate-100 mb-6">Aylık Trend</h2>
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
                <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                  {overview.monthlyTrend.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === overview.monthlyTrend.length - 1
                        ? 'url(#monthGrad)'
                        : 'rgba(103, 192, 144, 0.25)'}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#AAFFC7" />
                    <stop offset="100%" stopColor="#67C090" />
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
        className="glass-card p-6"
      >
        <h2 className="text-base font-bold text-slate-100 mb-6">Son 30 Gün — Günlük Tamamlanma</h2>
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
              <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                {(overview.dailyLast30 || []).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pct > 75 ? '#AAFFC7' : entry.pct > 40 ? '#67C090' : 'rgba(255,255,255,0.1)'}
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
        className="glass-card p-6"
      >
        <h2 className="text-base font-bold text-slate-100 mb-6">Aktivite Haritası — Son 30 Gün</h2>
        <HeatmapGrid data={overview?.dailyLast30 ?? []} />
      </motion.div>
    </motion.div>
  )
}
