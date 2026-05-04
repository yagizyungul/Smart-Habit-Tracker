import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FREQ_LABELS = { daily: 'Her gün', weekly: 'Haftalık', custom: 'Özel' }

export default function HabitCard({ habit, checked, onCheck, completionRate = 0 }) {
  const handleCheck = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onCheck(habit._id, checked)
  }

  const color = habit.color || '#8B5CF6'

  return (
    <Link to={`/habits/${habit._id}`} className="block group">
      <motion.div
        className="relative rounded-2xl p-4 h-full transition-all duration-300 overflow-hidden cursor-pointer"
        style={{
          background: checked
            ? `linear-gradient(135deg, ${color}10, ${color}06)`
            : 'rgba(255,255,255,0.04)',
          border: checked
            ? `1px solid ${color}40`
            : '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: checked
            ? `0 0 20px ${color}18, 0 4px 24px rgba(0,0,0,0.3)`
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}
        whileHover={{
          y: -3,
          boxShadow: `0 0 24px ${color}22, 0 8px 36px rgba(0,0,0,0.4)`,
          border: `1px solid ${color}50`,
        }}
        transition={{ duration: 0.22 }}
      >
        {/* Color accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{
            background: `linear-gradient(to right, ${color}80, ${color}20, transparent)`,
          }}
        />

        {/* Card body */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Checkbox */}
            <motion.button
              onClick={handleCheck}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={checked ? {
                background: color,
                boxShadow: `0 0 12px ${color}60`,
              } : {
                border: `2px solid rgba(255,255,255,0.18)`,
                background: 'transparent',
              }}
              whileTap={{ scale: 0.88 }}
            >
              {checked && (
                <motion.svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </motion.button>

            <div className="min-w-0">
              <div className={`font-semibold text-sm leading-tight truncate transition-all ${
                checked ? 'text-slate-500 line-through' : 'text-slate-100'
              }`}>
                {habit.title}
              </div>
              <div className="text-xs text-slate-600 mt-0.5 font-medium">
                {FREQ_LABELS[habit.frequency] || habit.frequency}
              </div>
            </div>
          </div>

          {/* Color dot */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Bu ay</span>
            <span className="text-[11px] font-bold" style={{ color }}>{completionRate}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${color}aa, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
