import { motion, AnimatePresence } from 'framer-motion'

export default function XPGain({ xp, x, y, onComplete }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: y, x: x, scale: 0.5 }}
        animate={{ opacity: 1, y: y - 80, scale: 1.2 }}
        exit={{ opacity: 0, scale: 1.5 }}
        onAnimationComplete={onComplete}
        className="fixed z-[9999] pointer-events-none flex items-center gap-1.5"
        style={{ color: '#AAFFC7', textShadow: '0 0 12px rgba(170,255,199,0.8)' }}
      >
        <span className="text-xl font-black font-display">+{xp}</span>
        <span className="text-xs font-bold uppercase tracking-widest mt-1">XP</span>
      </motion.div>
    </AnimatePresence>
  )
}
