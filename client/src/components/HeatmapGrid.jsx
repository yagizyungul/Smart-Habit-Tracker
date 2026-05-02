const LEVEL_CLASSES = ['bg-gray-100', 'bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700']

function intensityLevel(pct) {
  if (!pct) return 0
  if (pct <= 25) return 1
  if (pct <= 50) return 2
  if (pct <= 75) return 3
  return 4
}

export default function HeatmapGrid({ dates = null, data = null, days = 90 }) {
  const cells = []
  const today = new Date()

  if (dates) {
    const set = new Set(dates)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      cells.push({ date: ds, level: set.has(ds) ? 4 : 0 })
    }
  } else if (data) {
    data.forEach(({ date, pct }) => cells.push({ date, level: intensityLevel(pct) }))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-[3px]">
        {cells.map(({ date, level }) => (
          <div
            key={date}
            title={date}
            className={`w-3.5 h-3.5 rounded-sm ${LEVEL_CLASSES[level]}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
        <span>Az</span>
        {LEVEL_CLASSES.map((cls) => (
          <div key={cls} className={`w-3.5 h-3.5 rounded-sm ${cls}`} />
        ))}
        <span>Çok</span>
      </div>
    </div>
  )
}
