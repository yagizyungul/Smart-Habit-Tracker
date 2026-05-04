import { useState } from 'react'

const LEVELS = [
  { bg: 'rgba(255,255,255,0.04)', glow: 'transparent' },
  { bg: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.1)' },
  { bg: 'rgba(139,92,246,0.42)', glow: 'rgba(139,92,246,0.2)' },
  { bg: 'rgba(139,92,246,0.68)', glow: 'rgba(139,92,246,0.35)' },
  { bg: 'rgba(139,92,246,0.92)', glow: 'rgba(139,92,246,0.5)' },
]

function intensityLevel(pct) {
  if (!pct) return 0
  if (pct <= 25) return 1
  if (pct <= 50) return 2
  if (pct <= 75) return 3
  return 4
}

export default function HeatmapGrid({ dates = null, data = null, days = 90 }) {
  const [tooltip, setTooltip] = useState(null)
  const cells = []
  const today = new Date()

  if (dates) {
    const set = new Set(dates)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      cells.push({ date: ds, level: set.has(ds) ? 4 : 0, pct: set.has(ds) ? 100 : 0 })
    }
  } else if (data) {
    data.forEach(({ date, pct }) => cells.push({ date, level: intensityLevel(pct), pct }))
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-[3px]">
        {cells.map(({ date, level, pct }) => (
          <div
            key={date}
            className="w-3.5 h-3.5 rounded-sm cursor-pointer transition-transform hover:scale-125 relative"
            style={{
              backgroundColor: LEVELS[level].bg,
              boxShadow: level > 0 ? `0 0 6px ${LEVELS[level].glow}` : 'none',
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltip({ date, pct, x: rect.left, y: rect.top })
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-slate-600 font-medium">Az</span>
        {LEVELS.map((l, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-sm"
            style={{ backgroundColor: l.bg }}
          />
        ))}
        <span className="text-[10px] text-slate-600 font-medium">Çok</span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg text-xs text-slate-200 whitespace-nowrap"
          style={{
            background: 'rgba(14,14,26,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            top: tooltip.y - 40,
            left: tooltip.x,
            transform: 'translateX(-30%)',
          }}
        >
          <span className="text-slate-400">{tooltip.date}</span>
          {tooltip.pct > 0 && (
            <span className="ml-1.5 font-semibold text-violet-400">{tooltip.pct}%</span>
          )}
        </div>
      )}
    </div>
  )
}
