import { motion } from 'framer-motion'

export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-5">
      {/* Orbital rings */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Outer static ring */}
        <div className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.15)' }} />

        {/* Primary spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: '#8B5CF6' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />

        {/* Counter-spinning inner arc */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ border: '1.5px solid transparent', borderBottomColor: '#06B6D4' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center pulse */}
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: 'radial-gradient(circle, #A78BFA, #7C3AED)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>

      <motion.p
        className="text-slate-500 text-sm"
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Yükleniyor...
      </motion.p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base z-50">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
        </div>
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-14">{spinner}</div>
  )
}
