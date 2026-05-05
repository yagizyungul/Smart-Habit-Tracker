import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Lock, Bell, Palette, User as UserIcon, Trophy, Check } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme, ACCENT_PRESETS } from '../context/ThemeContext'
import LoadingSpinner from '../components/LoadingSpinner'

const EMOJI_CHOICES = ['🌱', '🚀', '🔥', '⚡', '🌟', '💎', '🎯', '🏆', '🦊', '🐉', '🌊', '🌸']

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { accent, setAccent } = useTheme()
  const [profile, setProfile] = useState(null)
  const [gamification, setGamification] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '' })
  const [pwMsg, setPwMsg] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/users/me'),
      api.get('/api/gamification/profile').catch(() => ({ data: null })),
    ]).then(([p, g]) => {
      setProfile(p.data)
      setGamification(g.data)
    })
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { data } = await api.patch('/api/users/me', {
        name: profile.name,
        avatarEmoji: profile.avatarEmoji,
        bio: profile.bio,
        accentColor: accent.primary,
        notificationPrefs: profile.notificationPrefs,
      })
      setProfile(data)
      refreshUser?.()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setPwSaving(true)
    setPwMsg(null)
    try {
      await api.patch('/api/users/me/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      })
      setPwMsg({ type: 'ok', text: 'Şifre güncellendi.' })
      setPwForm({ current: '', next: '' })
    } catch (err) {
      setPwMsg({ type: 'err', text: err.response?.data?.message || 'Hata oluştu' })
    } finally {
      setPwSaving(false)
    }
  }

  if (!profile) return <LoadingSpinner />

  return (
    <motion.div
      className="space-y-6 max-w-3xl"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-3xl font-black text-white text-glow">Profil & Ayarlar</h1>
        <p className="text-sm text-slate-400 mt-1">Hesabını kişiselleştir, görünümü değiştir.</p>
      </div>

      {gamification && (
        <div
          className="glass-card p-5 flex items-center gap-5 relative overflow-hidden"
        >
          <div
            className="absolute -top-12 -right-12 w-40 h-40 blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, var(--glow-mint), transparent 70%)' }}
          />
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), var(--glow-mint))',
              boxShadow: '0 0 24px rgba(170,255,199,0.35)',
            }}
          >
            {profile.avatarEmoji}
          </div>
          <div className="min-w-0 flex-1 relative">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-bold text-glow-mint">
                <Trophy className="w-3 h-3" /> Seviye {gamification.level} · {gamification.levelTitle}
              </span>
              <span className="text-xs text-slate-500">{gamification.xp} XP</span>
              <span className="text-xs text-slate-500">{gamification.stats.totalCheckins} check-in</span>
              <span className="text-xs text-slate-500">{gamification.stats.bestStreakOverall} gün rekor</span>
            </div>
          </div>
        </div>
      )}

      <Section icon={UserIcon} title="Profil">
        <Field label="İsim">
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-dark"
            maxLength={50}
          />
        </Field>

        <Field label="Avatar">
          <div className="flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <motion.button
                key={e}
                onClick={() => setProfile({ ...profile, avatarEmoji: e })}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all"
                style={profile.avatarEmoji === e ? {
                  background: 'rgba(170,255,199,0.15)',
                  border: '1px solid var(--glow-mint)',
                  boxShadow: '0 0 12px rgba(170,255,199,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileTap={{ scale: 0.92 }}
              >
                {e}
              </motion.button>
            ))}
          </div>
        </Field>

        <Field label="Bio">
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={2}
            maxLength={200}
            placeholder="Kendinden bahset..."
            className="input-dark resize-none"
          />
        </Field>
      </Section>

      <Section icon={Palette} title="Vurgu Rengi">
        <div className="flex flex-wrap gap-3">
          {ACCENT_PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              onClick={() => setAccent(preset)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all"
              style={accent.primary === preset.primary ? {
                background: `${preset.primary}15`,
                borderColor: preset.primary,
                boxShadow: `0 0 16px ${preset.primary}40`,
              } : {
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              whileTap={{ scale: 0.96 }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
              />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent.primary === preset.primary ? preset.secondary : '#94A3B8' }}>
                {preset.name}
              </span>
              {accent.primary === preset.primary && <Check className="w-3.5 h-3.5" style={{ color: preset.secondary }} />}
            </motion.button>
          ))}
        </div>
      </Section>

      <Section icon={Bell} title="Bildirimler">
        <Toggle
          label="E-posta hatırlatıcıları"
          checked={profile.notificationPrefs?.emailReminders ?? true}
          onChange={(v) => setProfile({
            ...profile,
            notificationPrefs: { ...(profile.notificationPrefs || {}), emailReminders: v },
          })}
        />
        <Toggle
          label="Tarayıcı bildirimleri"
          checked={profile.notificationPrefs?.browserPush ?? false}
          onChange={async (v) => {
            if (v && 'Notification' in window && Notification.permission !== 'granted') {
              const perm = await Notification.requestPermission()
              if (perm !== 'granted') return
            }
            setProfile({
              ...profile,
              notificationPrefs: { ...(profile.notificationPrefs || {}), browserPush: v },
            })
          }}
        />
      </Section>

      <div className="flex justify-end">
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {savedFlash ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {savedFlash ? 'Kaydedildi' : saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </motion.button>
      </div>

      <Section icon={Lock} title="Şifre">
        <form onSubmit={handlePassword} className="space-y-4">
          <Field label="Mevcut Şifre">
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              className="input-dark"
              required
            />
          </Field>
          <Field label="Yeni Şifre (en az 8 karakter)">
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              className="input-dark"
              required
              minLength={8}
            />
          </Field>
          {pwMsg && (
            <p className={`text-xs ${pwMsg.type === 'ok' ? 'text-glow-mint' : 'text-red-400'}`}>
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {pwSaving ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </Section>
    </motion.div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-glow-mint" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-3 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div
        className="w-11 h-6 rounded-full relative transition-all"
        style={{
          background: checked ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      </div>
    </button>
  )
}
