import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Calendar, Star, Plus, Check } from 'lucide-react'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import GamificationCard from '../components/GamificationCard'
import AIInsights from '../components/AIInsights'
import { useAuth } from '../context/AuthContext'
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
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card glass-card-hover relative p-6 overflow-hidden"
    >
      {/* Glow effect */}
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20"
        style={{ background: color }} 
      />

      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      <div className="stat-number text-3xl mb-1 text-glow" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-1 font-medium italic">{sub}</div>}
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
      <motion.div id="stat-cards" variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Bugün"
          value={`${completedToday}/${totalToday}`}
          sub={`${pct}% tamamlandı`}
          icon={Check}
          color="#AAFFC7"
        />
        <StatCard
          label="En Uzun Seri"
          value={`${analytics?.bestStreak?.streak ?? 0} gün`}
          sub={analytics?.bestStreak?.habitTitle || '—'}
          icon={Flame}
          color="#67C090"
        />
        <StatCard
          label="Bu Ay"
          value={`${analytics?.monthlyCompletion ?? 0}%`}
          sub="tamamlanma oranı"
          icon={TrendingUp}
          color="#AAFFC7"
        />
        <StatCard
          label="Mükemmel Gün"
          value={analytics?.perfectDays ?? 0}
          sub="son 30 günde"
          icon={Star}
          color="#67C090"
        />
        <StatCard
          label="Odaklanma"
          value={`${Math.floor((analytics?.weeklyFocusMinutes ?? 0) / 60)}s ${(analytics?.weeklyFocusMinutes ?? 0) % 60}d`}
          sub="bu hafta"
          icon={TrendingUp}
          color="#AAFFC7"
        />
      </motion.div>

      {/* Today's habits + weekly chart */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Today's habits */}
        <motion.div
          id="today-habits"
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Bugünkü Alışkanlıklar</h2>
              {totalToday > 0 && (
                <p className="text-xs text-slate-500 mt-1">{completedToday}/{totalToday} tamamlandı</p>
              )}
            </div>
            {totalToday > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-28 h-2 rounded-full overflow-hidden bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(to right, #67C090, #AAFFC7)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-bold text-glow-mint">{pct}%</span>
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
                <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                  {analytics.weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === analytics.weeklyData.length - 1
                        ? 'url(#barGrad)'
                        : 'rgba(103, 192, 144, 0.25)'}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
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

      {/* Alt Kısım: Gamification, Heatmap & AI Insights */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sol ve Orta Kolon: Gamification + Heatmap */}
        <div className="xl:col-span-2 space-y-5">
          <motion.div variants={itemVariants}>
            <GamificationCard />
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h2 className="text-base font-bold text-slate-100 mb-6">Son 30 Gün — Aktivite Haritası</h2>
            <HeatmapGrid data={overviewData?.dailyLast30 ?? []} />
          </motion.div>
        </div>

        {/* Sağ Kolon: AI Insights & Motivasyon */}
        <div className="space-y-5">
          <motion.div variants={itemVariants} className="h-full">
            <AIInsights />
          </motion.div>
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-center text-center" style={{ minHeight: '120px', background: 'rgba(103,192,144,0.05)', border: '1px solid rgba(103,192,144,0.1)' }}>
            <p className="text-sm font-bold text-slate-300 italic leading-relaxed mb-3">"Başarı her gün tekrarlanan küçük çabaların toplamıdır."</p>
            <p className="text-[10px] font-black text-glow-mint uppercase tracking-widest">— Robert Collier</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
