import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { ChevronLeft, Pencil, Trash2, Flame, Star, TrendingUp, Calendar } from 'lucide-react'
import api from '../services/api'
import HabitForm from '../components/HabitForm'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'

const FREQ_LABELS = { daily: 'Her gün', weekly: 'Haftalık', custom: 'Özel günler' }

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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function StatCard({ label, value, unit, icon: Icon, color }) {
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
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}18` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-number text-2xl" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </motion.div>
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

  useEffect(() => { loadData() }, [id])

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
      return { label: d.getDate().toString(), done: set.has(ds) ? 1 : 0, date: ds }
    })
  }

  if (loading) return <LoadingSpinner />

  if (!habit) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Alışkanlık bulunamadı.</p>
        <Link to="/habits" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
          ← Alışkanlıklara dön
        </Link>
      </div>
    )
  }

  const barData = buildBarData()
  const color = habit.color || '#8B5CF6'

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/habits"
            className="p-2 text-slate-500 rounded-xl transition-all hover:text-slate-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">{habit.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5 ml-6">
              <span className="text-sm text-slate-500">{FREQ_LABELS[habit.frequency] || habit.frequency}</span>
              {habit.description && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-sm text-slate-600 truncate max-w-xs">{habit.description}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-10 sm:ml-0">
          <motion.button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.09)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Düzenle
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl text-red-400 transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            whileHover={{ scale: 1.03, background: 'rgba(239,68,68,0.14)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Sil
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Mevcut Seri" value={analytics?.currentStreak ?? 0} unit="gün" icon={Flame} color="#F59E0B" />
        <StatCard label="En İyi Seri" value={analytics?.bestStreak ?? 0} unit="gün" icon={Star} color="#10B981" />
        <StatCard label="Bu Ay" value={`${analytics?.completionRate ?? 0}%`} icon={TrendingUp} color="#8B5CF6" />
        <StatCard label="Toplam" value={analytics?.completedDays ?? 0} unit="gün" icon={Calendar} color="#06B6D4" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
          <h2 className="text-sm font-bold text-slate-200 mb-4">Son 90 Gün</h2>
          <HeatmapGrid dates={checkinDates} days={90} />
        </motion.div>

        {/* Bar chart */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-sm font-bold text-slate-200 mb-4">Son 28 Gün</h2>
          <ResponsiveContainer width="100%" height={168}>
            <BarChart data={barData} barSize={10} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#475569' }}
                interval={6}
              />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                formatter={(v) => [v === 1 ? 'Tamamlandı ✓' : 'Tamamlanmadı', '']}
                contentStyle={DARK_TOOLTIP}
              />
              <Bar dataKey="done" radius={[3, 3, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.done === 1 ? color : 'rgba(255,255,255,0.06)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {showEdit && (
        <HabitForm
          initial={habit}
          onSave={handleEdit}
          onClose={() => setShowEdit(false)}
          loading={editLoading}
        />
      )}
    </motion.div>
  )
}
