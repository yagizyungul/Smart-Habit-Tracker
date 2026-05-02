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
        className={`bg-white rounded-xl border transition-all p-4 h-full ${
          checked ? 'border-green-200' : 'border-gray-200 hover:border-[#534AB7]/40'
        }`}
      >
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handleCheck}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked
                  ? 'bg-[#1D9E75] border-[#1D9E75]'
                  : 'border-gray-300 hover:border-[#1D9E75]'
              }`}
            >
              {checked && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 text-sm leading-tight truncate">{habit.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{FREQ_LABELS[habit.frequency] || habit.frequency}</div>
            </div>
          </div>
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: habit.color || '#534AB7' }}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Bu ay</span>
            <span className="text-xs font-medium text-gray-600">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%`, backgroundColor: habit.color || '#534AB7' }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
