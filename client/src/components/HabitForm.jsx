import { useState } from 'react'

const COLORS = ['#0B735F', '#639D75', '#0CDC2A', '#E3DBA9', '#384166']
const FREQ_OPTIONS = [
  { value: 'daily', label: 'Her gün' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'custom', label: 'Özel günler' },
]
const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export default function HabitForm({ initial = null, onSave, onClose, loading = false }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    frequency: initial?.frequency ?? 'daily',
    targetDays: initial?.targetDays ?? [0, 1, 2, 3, 4, 5, 6],
    color: initial?.color ?? '#0B735F',
    reminderTime: initial?.reminderTime ?? '',
  })

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

  const fieldClass = 'w-full rounded-2xl border border-[#639D75]/25 bg-[#F9F7EA] px-4 py-3 text-sm font-semibold text-[#384166] outline-none transition focus:border-[#0B735F] focus:ring-4 focus:ring-[#0CDC2A]/18'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#384166]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/70 bg-white/92 shadow-[0_30px_100px_rgba(56,65,102,0.28)] sm:max-w-md sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#639D75]/12 px-6 pb-4 pt-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#639D75]">rutin tohumu</p>
            <h2 className="text-xl font-black text-[#384166]">
              {initial ? 'Alışkanlığı düzenle' : 'Yeni alışkanlık'}
            </h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl text-[#639D75] transition hover:bg-[#E3DBA9]/35 hover:text-[#0B735F]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-black text-[#384166]">Ad *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass}
              placeholder="Örn: Meditasyon, kitap okuma..."
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#384166]">Açıklama</label>
            <textarea
              maxLength={300}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className={`${fieldClass} resize-none`}
              placeholder="İsteğe bağlı kısa açıklama"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#384166]">Sıklık</label>
            <div className="flex gap-2">
              {FREQ_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: value })}
                  className={`flex-1 rounded-2xl border py-2 text-xs font-black transition ${
                    form.frequency === value
                      ? 'border-[#0B735F] bg-[#0B735F] text-white'
                      : 'border-[#639D75]/22 bg-white text-[#639D75] hover:border-[#0B735F]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.frequency === 'custom' && (
            <div>
              <label className="mb-2 block text-sm font-black text-[#384166]">Günler</label>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-black transition ${
                      form.targetDays.includes(i)
                        ? 'border-[#0CDC2A] bg-[#0CDC2A] text-[#0B735F]'
                        : 'border-[#639D75]/22 bg-white text-[#639D75]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-black text-[#384166]">Renk</label>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`grid h-9 w-9 place-items-center rounded-2xl transition-transform ${
                    form.color === color ? 'scale-110 ring-2 ring-[#0CDC2A] ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#384166]">Hatırlatıcı saati</label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#639D75]/25 py-3 text-sm font-black text-[#639D75] transition hover:bg-[#E3DBA9]/35"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#0B735F] py-3 text-sm font-black text-white shadow-xl shadow-[#0B735F]/20 transition hover:bg-[#095f50] disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
