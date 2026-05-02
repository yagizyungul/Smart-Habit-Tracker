import { useState } from 'react'

const COLORS = ['#534AB7', '#1D9E75', '#E24B4A', '#F59E0B', '#3B82F6', '#EC4899']
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
    color: initial?.color ?? '#534AB7',
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              placeholder="Örn: Meditasyon, Kitap okuma…"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              maxLength={300}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent resize-none"
              placeholder="İsteğe bağlı kısa açıklama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sıklık</label>
            <div className="flex gap-2">
              {FREQ_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: value })}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    form.frequency === value
                      ? 'bg-[#EEEDFE] border-[#534AB7] text-[#534AB7]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Günler</label>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      form.targetDays.includes(i)
                        ? 'bg-[#534AB7] border-[#534AB7] text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Renk</label>
            <div className="flex gap-2.5">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    form.color === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hatırlatıcı Saati</label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#534AB7] text-white text-sm font-medium rounded-lg hover:bg-[#443c9a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
