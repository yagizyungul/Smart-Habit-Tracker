import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Check } from 'lucide-react'

const COLORS = ['#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899']
const FREQ_OPTIONS = [
  { value: 'daily', label: 'Her gün' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'custom', label: 'Özel günler' },
]
const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export default function HabitForm({ initial = null, onSave, onClose, loading = false, allHabits = [] }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    frequency: initial?.frequency ?? 'daily',
    targetDays: initial?.targetDays ?? [0, 1, 2, 3, 4, 5, 6],
    color: initial?.color ?? '#8B5CF6',
    reminderTime: initial?.reminderTime ?? '',
    linkedHabitIds: initial?.linkedHabitIds?.map((id) => String(id)) ?? [],
  })

  const otherHabits = allHabits.filter((h) => !initial || String(h._id) !== String(initial._id))

  const toggleLink = (id) => {
    setForm((f) => ({
      ...f,
      linkedHabitIds: f.linkedHabitIds.includes(id)
        ? f.linkedHabitIds.filter((x) => x !== id)
        : [...f.linkedHabitIds, id],
    }))
  }

  const toggleDay = (i) => {
    setForm((f) => ({
      ...f,
      targetDays: f.targetDays.includes(i)
        ? f.targetDays.filter((d) => d !== i)
        : [...f.targetDays, i].sort((a, b) => a - b),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(14,14,26,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 -8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.12)',
          }}
          initial={{ y: 60, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {initial ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {initial ? 'Bilgileri güncelle ve kaydet.' : 'Hedefine bir adım daha ekle.'}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 text-slate-500 rounded-xl transition-all"
              style={{ ':hover': { background: 'rgba(255,255,255,0.06)', color: '#E2E8F0' } }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Ad *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-dark"
                placeholder="Örn: Meditasyon, Kitap okuma…"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Açıklama</label>
              <textarea
                maxLength={300}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input-dark resize-none"
                placeholder="İsteğe bağlı kısa açıklama"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Sıklık</label>
              <div className="flex gap-2">
                {FREQ_OPTIONS.map(({ value, label }) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, frequency: value })}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all"
                    style={form.frequency === value ? {
                      background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.4)',
                      color: '#A78BFA',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#64748B',
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom days */}
            <AnimatePresence>
              {form.frequency === 'custom' && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Günler</label>
                  <div className="flex gap-1.5">
                    {DAYS.map((day, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                        style={form.targetDays.includes(i) ? {
                          background: 'rgba(139,92,246,0.2)',
                          border: '1px solid rgba(139,92,246,0.45)',
                          color: '#A78BFA',
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: '#475569',
                        }}
                        whileTap={{ scale: 0.92 }}
                      >
                        {day}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Renk</label>
              <div className="flex gap-3">
                {COLORS.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className="w-9 h-9 rounded-full flex items-center justify-center relative"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {form.color === color && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ boxShadow: `0 0 14px ${color}` }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Habit stacking */}
            {otherHabits.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Bağlantılı Alışkanlıklar <span className="opacity-70 normal-case">(Habit Stacking)</span>
                </label>
                <p className="text-[11px] text-slate-600 -mt-1">
                  Bu alışkanlıktan sonra yapılacakları seç — dashboard'da zincir olarak gösterilir.
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherHabits.map((h) => {
                    const id = String(h._id)
                    const active = form.linkedHabitIds.includes(id)
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        onClick={() => toggleLink(id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all"
                        style={active ? {
                          background: `${h.color || '#8B5CF6'}20`,
                          border: `1px solid ${h.color || '#8B5CF6'}60`,
                          color: '#fff',
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#94A3B8',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: h.color || '#8B5CF6' }} />
                        {h.title}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reminder time */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Hatırlatıcı Saati</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                <input
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-semibold rounded-xl text-slate-400 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}
                whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.97 }}
              >
                İptal
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold rounded-xl text-white disabled:opacity-55 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${form.color}cc, ${form.color})`,
                  boxShadow: `0 0 20px ${form.color}40`,
                }}
                whileHover={{ scale: 1.01, boxShadow: `0 0 30px ${form.color}55` }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  initial ? 'Güncelle' : 'Kaydet'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
