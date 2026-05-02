import { Link } from 'react-router-dom'

const FREQ_LABELS = { daily: 'Her gün', weekly: 'Haftalık', custom: 'Özel' }

export default function HabitCard({ habit, checked, onCheck, completionRate = 0 }) {
  const handleCheck = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onCheck(habit._id, checked)
  }

  return (
    <Link to={`/habits/${habit._id}`} className="block group">
      <div
        className={`h-full rounded-2xl border bg-white/82 p-4 shadow-[0_16px_45px_rgba(56,65,102,0.08)] backdrop-blur transition-all group-hover:-translate-y-1 ${
          checked ? 'border-[#0CDC2A]/55 bg-[#0CDC2A]/10' : 'border-white/70 hover:border-[#639D75]/45'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={handleCheck}
              className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl border-2 transition-all ${
                checked
                  ? 'border-[#0B735F] bg-[#0B735F] text-white pulse-sprout'
                  : 'border-[#639D75]/35 bg-[#F9F7EA] text-[#639D75] hover:border-[#0CDC2A] hover:text-[#0B735F]'
              }`}
              aria-label={checked ? `${habit.title} tamamlandı` : `${habit.title} tamamla`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-black leading-tight text-[#384166]">{habit.title}</div>
              <div className="mt-0.5 text-xs font-semibold text-[#639D75]">{FREQ_LABELS[habit.frequency] || habit.frequency}</div>
            </div>
          </div>
          <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: habit.color || '#0B735F' }} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-[#639D75]">Bu ay</span>
            <span className="text-xs font-black text-[#384166]">{completionRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E3DBA9]/45">
            <div
              className="grow-bar h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%`, backgroundColor: habit.color || '#0CDC2A' }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
