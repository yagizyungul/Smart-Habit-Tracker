const LEVEL_CLASSES = [
  'bg-[#E3DBA9]/35 border-[#E3DBA9]',
  'bg-[#E3DBA9] border-[#E3DBA9]',
  'bg-[#639D75] border-[#639D75]',
  'bg-[#0B735F] border-[#0B735F]',
  'bg-[#0CDC2A] border-[#0CDC2A]',
]

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
      cells.push({ date: ds, level: set.has(ds) ? 4 : 0, pct: set.has(ds) ? 100 : 0 })
    }
  } else if (data) {
    data.forEach(({ date, pct }) => cells.push({ date, level: intensityLevel(pct), pct }))
  }

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(18px,1fr))] gap-2">
        {cells.map(({ date, level, pct }) => (
          <div
            key={date}
            title={`${new Date(date).toLocaleDateString('tr-TR')} - ${pct ?? 0}%`}
            className={`h-8 min-w-[18px] rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${LEVEL_CLASSES[level]}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-[#639D75]">
        <span>Az</span>
        <div className="flex items-center gap-1.5">
          {LEVEL_CLASSES.map((cls) => (
            <div key={cls} className={`h-4 w-4 rounded-lg border ${cls}`} />
          ))}
        </div>
        <span>Çok</span>
      </div>
    </div>
  )
}
