import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { ChevronLeft, Flame, Star, TrendingUp, Calendar, Play } from 'lucide-react'
import api from '../services/api'
import HabitForm from '../components/HabitForm'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import HabitJournal from '../components/HabitJournal'
import PomodoroModal from '../components/PomodoroModal'

const FREQ_LABELS = { daily: 'Her gün', weekly: 'Haftalık', custom: 'Özel günler' }

const DARK_TOOLTIP = {
  background: 'rgba(33, 91, 99, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(170, 255, 199, 0.1)',
  borderRadius: '16px',
  fontSize: '11px',
  color: '#AAFFC7',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  padding: '12px 16px',
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
      className="glass-card p-6"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/5 border border-white/5">
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white text-glow">{value}</span>
        {unit && <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{unit}</span>}
      </div>
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2">{label}</div>
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
  const [showFocus, setShowFocus] = useState(false)
  const [allHabits, setAllHabits] = useState([])

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [habitRes, analyticsRes, checkinsRes, allRes] = await Promise.all([
        api.get(`/api/habits/${id}`),
        api.get(`/api/analytics/habit/${id}`),
        api.get(`/api/checkins/habit/${id}`),
        api.get('/api/habits'),
      ])
      setHabit(habitRes.data)
      setAnalytics(analyticsRes.data)
      setCheckinDates(checkinsRes.data)
      setAllHabits(allRes.data)
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
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
              />
              <h1 className="text-3xl font-black text-white text-glow">{habit.title}</h1>
            </div>
            <div className="flex items-center gap-3 mt-1.5 ml-7">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{FREQ_LABELS[habit.frequency] || habit.frequency}</span>
              {habit.description && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate max-w-xs">{habit.description}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <motion.button
            onClick={() => setShowFocus(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
            style={{
              background: `linear-gradient(135deg, ${color}25, ${color}40)`,
              border: `1px solid ${color}50`,
              color: '#fff',
              boxShadow: `0 0 18px ${color}30`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-3.5 h-3.5" />
            Odak Modu
          </motion.button>
          <motion.button
            onClick={() => setShowEdit(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Düzenle
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sil
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Mevcut Seri" value={analytics?.currentStreak ?? 0} unit="gün" icon={Flame} color="#67C090" />
        <StatCard label="En İyi Seri" value={analytics?.bestStreak ?? 0} unit="gün" icon={Star} color="#AAFFC7" />
        <StatCard label="Başarı Oranı" value={`${analytics?.completionRate ?? 0}%`} icon={TrendingUp} color="#67C090" />
        <StatCard label="Toplam Gün" value={analytics?.completedDays ?? 0} unit="gün" icon={Calendar} color="#AAFFC7" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Son 90 Gün</h2>
          <HeatmapGrid dates={checkinDates} days={90} color="#67C090" />
        </motion.div>

        {/* Bar chart */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Son 28 Gün</h2>
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

      {/* Visual Journal */}
      <motion.div variants={itemVariants}>
        <HabitJournal habitId={id} color={color} />
      </motion.div>

      {showEdit && (
        <HabitForm
          initial={habit}
          onSave={handleEdit}
          onClose={() => setShowEdit(false)}
          loading={editLoading}
          allHabits={allHabits}
        />
      )}

      {showFocus && (
        <PomodoroModal
          habit={habit}
          onClose={() => setShowFocus(false)}
          onComplete={async () => {
            const today = new Date().toISOString().split('T')[0]
            try {
              await api.post('/api/checkins', { habitId: id, date: today })
              await loadData()
            } catch {}
          }}
        />
      )}
    </motion.div>
  )
}
