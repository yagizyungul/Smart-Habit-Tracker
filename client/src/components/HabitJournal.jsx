import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Camera, Trash2, Save, BookOpen } from 'lucide-react'
import api from '../services/api'

const MAX_BYTES = 350_000

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxSide = 720
        const ratio = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        if (dataUrl.length > MAX_BYTES) {
          const dataUrl2 = canvas.toDataURL('image/jpeg', 0.5)
          resolve(dataUrl2)
        } else {
          resolve(dataUrl)
        }
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function HabitJournal({ habitId, color = '#67C090' }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // { _id, note, photo }
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/checkins/journal/${habitId}`)
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [habitId])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await compressImage(file)
      setEditing((prev) => ({ ...(prev || {}), photo: data }))
    } catch {}
    e.target.value = ''
  }

  const save = async () => {
    if (!editing?._id) return
    setSaving(true)
    try {
      await api.patch(`/api/checkins/${editing._id}`, {
        note: editing.note ?? '',
        photo: editing.photo ?? '',
      })
      setEditing(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="h-6 w-40 bg-white/5 rounded mb-4 animate-pulse" />
        <div className="h-32 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="w-4 h-4" style={{ color }} />
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Görsel Günlük</h2>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-600">
          {entries.length} kayıt
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-10">
          <Camera className="w-10 h-10 mx-auto text-slate-700 mb-3" />
          <p className="text-sm text-slate-400">Henüz günlük girişin yok</p>
          <p className="text-xs text-slate-600 mt-1">Bir check-in'e tıklayıp not veya fotoğraf ekle</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {entries.map((c) => {
            const has = c.photo || c.note
            return (
              <motion.button
                key={c._id}
                onClick={() => setEditing({ _id: c._id, note: c.note || '', photo: c.photo || '' })}
                className="aspect-square rounded-xl overflow-hidden relative group transition-all"
                style={{
                  background: c.photo ? '#000' : 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {c.photo ? (
                  <img src={c.photo} alt={c.date} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3">
                    {c.note ? (
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-4 text-left w-full">
                        {c.note}
                      </p>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
                >
                  {c.date.slice(5)}
                  {!has && <span className="text-slate-500 ml-1">+ ekle</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {editing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setEditing(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background: 'rgba(14,16,28,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <h3 className="text-lg font-bold text-white mb-1">Günlük Girişi</h3>
            <p className="text-xs text-slate-500 mb-5">Fotoğraf ve nota düzenle.</p>

            {editing.photo ? (
              <div className="relative mb-4">
                <img src={editing.photo} alt="" className="w-full max-h-96 object-cover rounded-xl" />
                <button
                  onClick={() => setEditing({ ...editing, photo: '' })}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 text-white hover:bg-red-500/80 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-2 mb-4 transition-all hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}
              >
                <Camera className="w-8 h-8 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Fotoğraf Yükle</span>
                <span className="text-[10px] text-slate-600">Otomatik sıkıştırılacak</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />

            <textarea
              value={editing.note}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
              maxLength={200}
              rows={3}
              placeholder="Bugün nasıl gitti?"
              className="input-dark resize-none"
            />
            <div className="text-right text-[10px] text-slate-600 mt-1">
              {editing.note.length}/200
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl text-slate-400 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}
              >
                İptal
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-3 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${color}, var(--glow-mint))`,
                  color: '#0E1A20',
                }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
