import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Clock, Flame, AlertCircle } from 'lucide-react'
import api from '../services/api'

const READ_KEY = 'streakly_notif_read'

function readReadSet() {
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function writeReadSet(set) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...set])) } catch {}
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [habits, setHabits] = useState([])
  const [todayCheckedIds, setTodayCheckedIds] = useState(new Set())
  const [now, setNow] = useState(new Date())
  const [readSet, setReadSet] = useState(() => readReadSet())
  const pushedRef = useRef(new Set())
  const wrapRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [h, c] = await Promise.all([
          api.get('/api/habits'),
          api.get('/api/checkins/today'),
        ])
        setHabits(h.data)
        setTodayCheckedIds(new Set(c.data.map((x) => String(x.habitId))))
      } catch {}
    }
    fetch()
    const i = setInterval(fetch, 60_000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const today = now.toISOString().split('T')[0]
  const dow = now.getDay()

  const notifications = useMemo(() => {
    const list = []
    const nowMin = now.getHours() * 60 + now.getMinutes()

    for (const h of habits) {
      const id = String(h._id)
      const isTarget = h.frequency === 'daily' || (h.targetDays || []).includes(dow)
      if (!isTarget || todayCheckedIds.has(id)) continue

      // Hatırlatıcı saati gelmiş ve geçmişse
      if (h.reminderTime) {
        const [hh, mm] = h.reminderTime.split(':').map(Number)
        const reminderMin = hh * 60 + mm
        if (nowMin >= reminderMin) {
          list.push({
            id: `reminder_${id}_${today}`,
            kind: 'reminder',
            icon: Clock,
            color: '#3B82F6',
            title: `${h.title} için zaman geldi`,
            body: `Saat ${h.reminderTime} hatırlatıcısı. Hadi check-in yap!`,
            ts: reminderMin,
          })
          continue
        }
      }
    }

    // Akşam 8 sonrası tamamlanmamış alışkanlıklar
    if (nowMin >= 20 * 60) {
      const remaining = habits.filter((h) => {
        const id = String(h._id)
        const isTarget = h.frequency === 'daily' || (h.targetDays || []).includes(dow)
        return isTarget && !todayCheckedIds.has(id)
      })
      if (remaining.length > 0) {
        list.push({
          id: `evening_${today}`,
          kind: 'evening',
          icon: AlertCircle,
          color: '#F59E0B',
          title: `${remaining.length} alışkanlık seni bekliyor`,
          body: 'Gün bitmeden serini koru.',
          ts: 20 * 60,
        })
      }
    }

    // Mükemmel gün
    const expectedToday = habits.filter((h) =>
      h.frequency === 'daily' || (h.targetDays || []).includes(dow)
    ).length
    if (expectedToday > 0 && todayCheckedIds.size >= expectedToday) {
      list.push({
        id: `perfect_${today}`,
        kind: 'perfect',
        icon: Flame,
        color: '#67C090',
        title: 'Mükemmel gün! 🔥',
        body: 'Bugünün tüm alışkanlıklarını tamamladın.',
        ts: 23 * 60,
      })
    }

    return list.sort((a, b) => b.ts - a.ts)
  }, [habits, todayCheckedIds, dow, now, today])

  // Browser push notifications
  useEffect(() => {
    const pref = (() => {
      try { return JSON.parse(localStorage.getItem('streakly_user'))?.notificationPrefs?.browserPush } catch { return false }
    })()
    if (!pref) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    for (const n of notifications) {
      if (pushedRef.current.has(n.id) || readSet.has(n.id)) continue
      pushedRef.current.add(n.id)
      try {
        new Notification('Streakly', { body: `${n.title} — ${n.body}`, silent: false })
      } catch {}
    }
  }, [notifications, readSet])

  const unreadCount = notifications.filter((n) => !readSet.has(n.id)).length

  const markAllRead = () => {
    const next = new Set(readSet)
    notifications.forEach((n) => next.add(n.id))
    setReadSet(next)
    writeReadSet(next)
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-slate-400 rounded-xl hover:text-glow-mint hover:bg-white/5 transition-all"
        title="Bildirimler"
      >
        {unreadCount > 0 ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-[#0E1A20]"
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), var(--glow-mint))',
              boxShadow: '0 0 12px rgba(170,255,199,0.5)',
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(14,16,28,0.98)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Bildirimler</span>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-glow-mint transition-colors"
                >
                  Tümünü okundu işaretle
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-2xl mb-2">🌙</div>
                  <p className="text-xs text-slate-500">Şu an bildirim yok</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readSet.has(n.id)
                  const Icon = n.icon
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: isRead ? 0.55 : 1 }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${n.color}20`, border: `1px solid ${n.color}30` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: n.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-100 truncate">{n.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{n.body}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
