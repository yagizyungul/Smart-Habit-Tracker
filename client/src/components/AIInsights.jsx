import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, RefreshCw } from 'lucide-react'
import api from '../services/api'

export default function AIInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/api/ai/insights')
      setInsights(data.insights || [])
    } catch {
      setInsights([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  return (
    <motion.div
      className="glass-card p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="absolute -top-12 -left-12 w-36 h-36 blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle, var(--accent-green), transparent 70%)' }}
      />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), var(--glow-mint))',
              boxShadow: '0 0 18px rgba(103,192,144,0.35)',
            }}
          >
            <Brain className="w-4 h-4 text-[#0E1A20]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI İçgörüleri</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Haftalık akıllı analiz</p>
          </div>
        </div>
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-slate-500 rounded-lg hover:text-glow-mint hover:bg-white/5 transition-colors"
          whileTap={{ scale: 0.92 }}
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8 relative">
          <div className="text-2xl mb-2">🌱</div>
          <p className="text-sm text-slate-400">Henüz analiz edilecek yeterli veri yok</p>
          <p className="text-xs text-slate-600 mt-1">Birkaç gün check-in yaptıktan sonra dön</p>
        </div>
      ) : (
        <div className="space-y-2 relative">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="text-xl flex-shrink-0 leading-none mt-0.5">{ins.emoji}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100">{ins.title}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-snug">{ins.body}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
