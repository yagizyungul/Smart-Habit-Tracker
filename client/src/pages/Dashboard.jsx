import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar,
} from 'recharts'
import api from '../services/api'
import HeatmapGrid from '../components/HeatmapGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const METRIC_COLORS = ['#0B735F', '#0CDC2A', '#639D75', '#384166']

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    check: 'M20 6 9 17l-5-5',
    flame: 'M8.5 14.5A3.5 3.5 0 0 0 12 18a4 4 0 0 0 4-4c0-2.5-1.5-4-3-5.5.2 1.7-.7 2.8-1.8 3.3.2-2.2-1.2-4.1-3-5.3.3 2.8-2.2 4.3-2.2 7A4 4 0 0 0 12 18',
    spark: 'M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z',
    calendar: 'M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
    arrow: 'M5 12h14M13 5l7 7-7 7',
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_55px_rgba(56,65,102,0.10)] backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#639D75]">{label}</div>
          <div className="mt-2 truncate text-2xl font-black text-[#384166]">{value}</div>
          {sub && <div className="mt-1 truncate text-xs font-medium text-[#639D75]">{sub}</div>}
        </div>
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-white shadow-lg" style={{ backgroundColor: color }}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#0CDC2A]/15 text-[#0B735F] pulse-sprout">
          <Icon name="spark" className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-[#384166]">Henüz alışkanlık yok</p>
        <p className="mt-1 text-sm text-[#639D75]">İlk ritüelini ekle ve bugünkü seriyi başlat.</p>
        <Link to="/habits" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B735F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#095f50]">
          Alışkanlık ekle
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
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
  const progress = totalToday ? Math.round((completedToday / totalToday) * 100) : 0
  const firstName = user?.name?.split(' ')[0] || 'Bugün'
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Günaydın'
    if (h < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  const topHabits = habits.slice(0, 5)
  const remaining = Math.max(totalToday - topHabits.length, 0)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0B735F] text-white shadow-[0_30px_90px_rgba(11,115,95,0.30)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(12,220,42,0.34),transparent_32%),radial-gradient(circle_at_78%_0%,rgba(227,219,169,0.28),transparent_28%),linear-gradient(135deg,#0B735F_0%,#384166_70%,#0B735F_100%)]" />
        <span className="leaf right-20 top-12 hidden opacity-50 lg:block" />
        <span className="leaf leaf-soft bottom-10 left-1/2 hidden opacity-45 lg:block [animation-delay:1.6s]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B735F]/80 to-transparent" />
        <div className="relative grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-8">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0CDC2A] pulse-sprout" />
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                {greeting()}, {firstName}. Bugünün ritmini yakala.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#E3DBA9] sm:text-base">
                Küçük tamamlamalar büyük serilere dönüşür. Önceliğin net: bugün {totalToday} alışkanlıktan {completedToday} tanesi tamamlandı.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/habits" className="inline-flex items-center gap-2 rounded-2xl bg-[#0CDC2A] px-4 py-2.5 text-sm font-black text-[#0B735F] shadow-xl transition hover:bg-[#E3DBA9]">
                <Icon name="plus" className="h-4 w-4" />
                Yeni alışkanlık
              </Link>
              <Link to="/analytics" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
                Analitiği gör
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E3DBA9]">Günlük akış</p>
                <p className="mt-1 text-sm text-[#E3DBA9]/70">Tamamlama hedefi</p>
              </div>
              <div className="rounded-full bg-emerald-400/14 px-3 py-1 text-xs font-bold text-emerald-100">
                {completedToday}/{totalToday}
              </div>
            </div>
            <div className="mt-5 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="72%" outerRadius="98%" data={[{ name: 'progress', value: progress }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={16} fill="#0CDC2A" background={{ fill: 'rgba(227,219,169,0.16)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-28 grid h-28 place-items-center">
              <div className="text-center">
                <div className="text-5xl font-black">{progress}%</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E3DBA9]">tamamlandı</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Bugün" value={`${completedToday}/${totalToday}`} sub="tamamlandı" color={METRIC_COLORS[0]} icon="check" />
        <StatCard label="En uzun seri" value={`${analytics?.bestStreak?.streak ?? 0} gün`} sub={analytics?.bestStreak?.habitTitle || 'Henüz seri yok'} color={METRIC_COLORS[1]} icon="flame" />
        <StatCard label="Bu ay" value={`${analytics?.monthlyCompletion ?? 0}%`} sub="tamamlanma oranı" color={METRIC_COLORS[2]} icon="spark" />
        <StatCard label="Mükemmel gün" value={analytics?.perfectDays ?? 0} sub="son 30 günde" color={METRIC_COLORS[3]} icon="calendar" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_60px_rgba(56,65,102,0.10)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#384166]">Bugünün alışkanlıkları</h2>
              <p className="mt-1 text-sm text-[#639D75]">Tek dokunuşla serini güncelle.</p>
            </div>
            {totalToday > 0 && <span className="rounded-full bg-[#E3DBA9]/60 px-3 py-1 text-xs font-bold text-[#0B735F]">{completedToday}/{totalToday}</span>}
          </div>

          {habits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {topHabits.map((habit) => {
                const done = checkedIds.has(String(habit._id))
                return (
                  <div
                    key={habit._id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                      done ? 'border-[#0CDC2A]/50 bg-[#0CDC2A]/10' : 'border-[#639D75]/18 bg-white/82 hover:border-[#639D75]/45 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => handleCheckin(String(habit._id))}
                      className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg border-2 transition ${
                        done ? 'border-[#0B735F] bg-[#0B735F] text-white pulse-sprout' : 'border-[#639D75]/25 bg-[#F9F7EA] text-[#639D75] hover:border-[#0CDC2A] hover:text-[#0B735F]'
                      }`}
                      aria-label={done ? `${habit.title} tamamlandı` : `${habit.title} tamamla`}
                    >
                      <Icon name="check" className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-sm font-black ${done ? 'text-[#0B735F]' : 'text-[#384166]'}`}>{habit.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[#639D75]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color || '#0B735F' }} />
                        <span>{habit.frequency === 'weekly' ? 'Haftalık' : habit.frequency === 'daily' ? 'Günlük' : 'Özel'}</span>
                      </div>
                    </div>
                    <Link to={`/habits/${habit._id}`} className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-[#639D75] transition hover:bg-[#E3DBA9]/55 hover:text-[#0B735F]" aria-label={`${habit.title} detayları`}>
                      <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                  </div>
                )
              })}
              {remaining > 0 && (
                <Link to="/habits" className="flex items-center justify-center rounded-lg border border-dashed border-[#639D75]/40 px-4 py-3 text-sm font-bold text-[#0B735F] transition hover:border-[#0B735F] hover:bg-[#E3DBA9]/35">
                  +{remaining} alışkanlığı daha gör
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_60px_rgba(56,65,102,0.10)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#384166]">Haftalık tempo</h2>
              <p className="mt-1 text-sm text-[#639D75]">Son günlerin tamamlanma yüzdesi.</p>
            </div>
          </div>
          {analytics?.weeklyData?.length ? (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={analytics.weeklyData} barSize={34} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#639D75', fontWeight: 700 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F7F5E7' }}
                  formatter={(v) => [`${v}%`, 'Tamamlanma']}
                  contentStyle={{ fontSize: 12, borderRadius: 14, border: '1px solid rgba(99,157,117,0.25)', boxShadow: '0 16px 40px rgba(56,65,102,0.14)' }}
                />
                <Bar dataKey="pct" radius={[8, 8, 8, 8]}>
                  {analytics.weeklyData.map((_, i) => (
                    <Cell key={i} fill={i === analytics.weeklyData.length - 1 ? '#0CDC2A' : i % 2 ? '#639D75' : '#E3DBA9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-[290px] place-items-center rounded-lg bg-[#E3DBA9]/20 text-sm font-medium text-[#639D75]">Henüz veri yok</div>
          )}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_60px_rgba(56,65,102,0.10)] backdrop-blur">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-black text-[#384166]">Son 30 gün haritası</h2>
            <p className="mt-1 text-sm text-[#639D75]">Rutinlerinin hangi günlerde parladığını gör.</p>
          </div>
          <Link to="/analytics" className="text-sm font-bold text-[#0B735F] hover:text-[#0CDC2A]">Detaylı analiz</Link>
        </div>
        <HeatmapGrid data={overviewData?.dailyLast30 ?? []} />
      </section>
    </div>
  )
}
