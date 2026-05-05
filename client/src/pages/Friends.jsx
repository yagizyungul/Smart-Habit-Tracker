import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, UserPlus, X, Crown, Flame, UserMinus, Check } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Friends() {
  const [leaderboard, setLeaderboard] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [sentIds, setSentIds] = useState(new Set())

  const load = async () => {
    try {
      const [lb, rq] = await Promise.all([
        api.get('/api/social/leaderboard'),
        api.get('/api/social/requests'),
      ])
      setLeaderboard(lb.data)
      setRequests(rq.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/social/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchResults(data)
      } catch {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const sendRequest = async (id) => {
    try {
      await api.post('/api/social/request', { userId: id })
      setSentIds((prev) => new Set([...prev, id]))
    } catch {}
  }

  const accept = async (id) => {
    try {
      await api.post('/api/social/accept', { userId: id })
      load()
    } catch {}
  }

  const reject = async (id) => {
    try {
      await api.post('/api/social/reject', { userId: id })
      load()
    } catch {}
  }

  const removeFriend = async (id) => {
    if (!confirm('Bu arkadaşı kaldırmak istediğinden emin misin?')) return
    try {
      await api.delete(`/api/social/friend/${id}`)
      load()
    } catch {}
  }

  if (loading) return <LoadingSpinner />

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white text-glow">Arkadaşlar</h1>
          <p className="text-sm text-slate-400 mt-1">Lider tablosu, istekler, arkadaş ekle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon: Lider Tablosu */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-glow-mint" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Lider Tablosu
              </h2>
            </div>

            {leaderboard.length === 1 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 mb-1">Henüz arkadaşın yok</p>
                <p className="text-xs text-slate-600">Arkadaş ekle, birlikte motive olun</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((row, i) => {
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
                  return (
                    <div
                      key={row._id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{
                        background: row.isMe ? 'rgba(170,255,199,0.06)' : 'rgba(255,255,255,0.03)',
                        border: row.isMe ? '1px solid rgba(170,255,199,0.2)' : '1px solid transparent',
                      }}
                    >
                      <div className="w-9 text-center font-bold text-sm flex items-center justify-center">
                        {i < 3 ? <span className="text-xl leading-none">{medal}</span> : <span className="text-slate-500">{medal}</span>}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        {row.avatarEmoji || '🌱'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-bold truncate ${row.isMe ? 'text-glow-mint' : 'text-slate-100'}`}>
                          {row.name} {row.isMe && '(sen)'}
                        </div>
                        <div className="text-xs text-slate-500">{row.totalCheckins} check-in</div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-bold text-amber-300">{row.bestStreak}</span>
                      </div>
                      {!row.isMe && (
                        <button
                          onClick={() => removeFriend(row._id)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Arkadaşlıktan çıkar"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon: İstekler ve Arkadaş Ekle */}
        <div className="space-y-6">
          {requests.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-glow-mint" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Gelen İstekler ({requests.length})
                </h2>
              </div>
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="flex flex-col gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(170,255,199,0.1)', border: '1px solid rgba(170,255,199,0.2)' }}
                      >
                        {r.avatarEmoji || '🌱'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-100 truncate">{r.name}</div>
                        {r.bio && <div className="text-xs text-slate-500 truncate">{r.bio}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => accept(r._id)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        style={{
                          background: 'rgba(103,192,144,0.15)',
                          color: 'var(--glow-mint)',
                          border: '1px solid rgba(103,192,144,0.3)',
                        }}
                      >
                        <Check className="w-3.5 h-3.5 inline mb-0.5" /> Kabul
                      </button>
                      <button
                        onClick={() => reject(r._id)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 hover:bg-red-400/10 hover:text-red-400 transition-all"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(170,255,199,0.1)' }}>
              <Search className="w-5 h-5 text-glow-mint" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Yeni Arkadaşlar Bul</h3>
            <p className="text-xs text-slate-400 mb-5">Sisteme yeni kişiler ekleyerek lider tablosundaki rekabeti artır.</p>
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full btn-primary py-2.5 text-sm"
            >
              Ara ve Ekle
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-12"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              style={{
                background: 'rgba(14,16,28,0.97)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İsim veya e-posta ile ara..."
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-600 text-sm"
                />
                <button onClick={() => setSearchOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs text-slate-500">
                    {searchQuery.length < 2 ? 'En az 2 karakter yaz' : 'Kullanıcı bulunamadı'}
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        {u.avatarEmoji || '🌱'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-100 truncate">{u.name}</div>
                        {u.bio && <div className="text-xs text-slate-500 truncate">{u.bio}</div>}
                      </div>
                      <button
                        onClick={() => sendRequest(u._id)}
                        disabled={sentIds.has(u._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-60"
                        style={sentIds.has(u._id) ? {
                          background: 'rgba(103,192,144,0.15)',
                          color: 'var(--glow-mint)',
                        } : {
                          background: 'rgba(170,255,199,0.1)',
                          color: 'var(--glow-mint)',
                          border: '1px solid rgba(170,255,199,0.25)',
                        }}
                      >
                        {sentIds.has(u._id) ? '✓ Gönderildi' : 'İstek Gönder'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
