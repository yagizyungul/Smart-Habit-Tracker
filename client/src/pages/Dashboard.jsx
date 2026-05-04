import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Calendar, Star, Plus, Check } from 'lucide-react'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useDataCache, CACHE_KEYS } from '../context/DataCacheContext'

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
  hidden: { opacity: 0, y: 16 },
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
        WebkitBackdropFilter: 'blur(12px)',
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* Gradient corner accent */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-[0.07] pointer-events-none"
        style={{ background: gradient }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>

      <div className="stat-number text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5 truncate">{sub}</div>}
    </motion.div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default function Dashboard() {
  const { user } = useAuth()
  const cache = useDataCache()
  const [analytics, setAnalytics] = useState(null)
  const [habits, setHabits] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Önce cache'den anında yükle
    const cachedHabits    = cache.get(CACHE_KEYS.HABITS)
    const cachedAnalytics = cache.get(CACHE_KEYS.ANALYTICS_DASHBOARD)
    const cachedCheckins  = cache.get(CACHE_KEYS.CHECKINS_TODAY)
    const cachedOverview  = cache.get(CACHE_KEYS.ANALYTICS_OVERVIEW)

    if (cachedHabits && cachedAnalytics && cachedCheckins && cachedOverview) {
      // Cache tam dolu — anında göster, API isteği yok
      setHabits(cachedHabits)
      setAnalytics(cachedAnalytics)
      setCheckedIds(new Set(cachedCheckins.map((c) => String(c.habitId))))
      setOverviewData(cachedOverview)
      setLoading(false)
    } else {
      // Cache boş (ilk açılış veya temizlenmiş) — API'den çek
      loadAll()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    try {
      const [aRes, hRes, cRes, oRes] = await Promise.all([
        api.get('/api/analytics/dashboard'),
        api.get('/api/habits'),
        api.get('/api/checkins/today'),
        api.get('/api/analytics/overview'),
      ])
      setAnalytics(aRes.data)
      setHabits(hRes.data)
      setCheckedIds(new Set(cRes.data.map((c) => String(c.habitId))))
      setOverviewData(oRes.data)
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
      // Checkin sonrası dashboard ve bugünkü checkin listesini tazele
      const [freshDash, freshCheckins] = await Promise.all([
        cache.invalidate(CACHE_KEYS.ANALYTICS_DASHBOARD),
        cache.invalidate(CACHE_KEYS.CHECKINS_TODAY),
      ])
      if (freshDash) setAnalytics(freshDash)
      if (freshCheckins) setCheckedIds(new Set(freshCheckins.map((c) => String(c.habitId))))
    } catch {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
    }
  }

  if (loading) return <LoadingSpinner />

  const completedToday = checkedIds.size
  const totalToday = habits.length
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/habits"
          className="btn-primary flex-shrink-0 text-sm"
          style={{ padding: '0.5rem 1rem', gap: '0.375rem' }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Alışkanlık</span>
          <span className="sm:hidden">Ekle</span>
        </Link>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Bugün"
          value={`${completedToday}/${totalToday}`}
          sub={`${pct}% tamamlandı`}
          icon={Check}
          color="#10B981"
          gradient="linear-gradient(135deg, #10B981, #059669)"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${analytics?.bestStreak?.streak ?? 0} gün`}
          sub={analytics?.bestStreak?.habitTitle || '—'}
          icon={Flame}
          color="#F59E0B"
          gradient="linear-gradient(135deg, #F59E0B, #D97706)"
        />
        <StatCard
          label="Bu Ay"
          value={`${analytics?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          icon={TrendingUp}
          color="#8B5CF6"
          gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
        />
        <StatCard
          label="Mükemmel Gün"
          value={analytics?.perfectDays ?? 0}
          sub="son 30 günde"
          icon={Star}
          color="#06B6D4"
          gradient="linear-gradient(135deg, #06B6D4, #0891B2)"
        />
      </motion.div>

      {/* Today's habits + weekly chart */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Today's habits */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Bugünkü Alışkanlıklar</h2>
              {totalToday > 0 && (
                <p className="text-xs text-slate-600 mt-0.5">{completedToday}/{totalToday} tamamlandı</p>
              )}
            </div>
            {totalToday > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(to right, #8B5CF6, #06B6D4)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-bold text-violet-400">{pct}%</span>
              </div>
            )}
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Calendar className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-slate-500 text-sm mb-3">Henüz alışkanlık yok</p>
              <Link to="/habits" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                İlk alışkanlığını ekle →
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {habits.map((habit) => {
                const done = checkedIds.has(String(habit._id))
                const color = habit.color || '#8B5CF6'
                return (
                  <motion.div
                    key={habit._id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                    style={{ background: done ? `${color}0C` : 'rgba(255,255,255,0.03)' }}
                    whileHover={{ background: done ? `${color}14` : 'rgba(255,255,255,0.06)' }}
                    onClick={() => handleCheckin(String(habit._id))}
                  >
                    <motion.button
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={done ? {
                        background: color,
                        boxShadow: `0 0 10px ${color}55`,
                      } : {
                        border: '2px solid rgba(255,255,255,0.2)',
                      }}
                      whileTap={{ scale: 0.85 }}
                    >
                      {done && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                    <span className={`flex-1 text-sm font-medium min-w-0 truncate ${
                      done ? 'text-slate-600 line-through' : 'text-slate-200'
                    }`}>
                      {habit.title}
                    </span>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}80` }} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Weekly chart */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-sm font-bold text-slate-200 mb-4">Bu Hafta</h2>
          {analytics?.weeklyData?.length ? (
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={analytics.weeklyData} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(v) => [`${v}%`, 'Tamamlanma']}
                  contentStyle={DARK_TOOLTIP}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {analytics.weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === analytics.weeklyData.length - 1
                        ? 'url(#barGrad)'
                        : 'rgba(139,92,246,0.22)'}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
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
        <h2 className="text-sm font-bold text-slate-200 mb-4">Son 30 Gün — Aktivite Haritası</h2>
        <HeatmapGrid data={overviewData?.dailyLast30 ?? []} />
      </motion.div>
    </motion.div>
  )
}
