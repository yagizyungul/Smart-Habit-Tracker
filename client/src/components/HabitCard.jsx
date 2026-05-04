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
        className="glass-card glass-card-hover relative p-5 h-full overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow accent */}
        <div
          className="absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-10"
          style={{ background: color }}
        />

        {/* Card body */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Checkbox */}
            <motion.button
              onClick={handleCheck}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={checked ? {
                background: `linear-gradient(135deg, ${color}, #AAFFC7)`,
                boxShadow: `0 0 15px ${color}40`,
              } : {
                border: `2px solid rgba(255,255,255,0.1)`,
                background: 'rgba(255,255,255,0.05)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
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
              <div className={`font-bold text-sm leading-tight truncate transition-all duration-300 ${
                checked ? 'text-slate-500 line-through opacity-70' : 'text-slate-100'
              }`}>
                {habit.title}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
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

        {/* Progress section */}
        <div className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">İlerleme</span>
            <span className="text-xs font-black text-glow" style={{ color }}>{completionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${color}88, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
