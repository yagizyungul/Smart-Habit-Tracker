import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import VoiceCoach from '../VoiceCoach'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen relative selection:bg-glow-mint/30 selection:text-glow-mint">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <VoiceCoach />
    </div>
  )
}
