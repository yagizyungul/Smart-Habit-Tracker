import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Sparkles, Zap } from 'lucide-react'

const TOUR_STEPS = [
  {
    target: 'center',
    title: 'Streakly\'ye Hoş Geldin! 🚀',
    content: 'Alışkanlıklarını takip etmek ve hayatını dönüştürmek için harika bir yerdesin. Sana kısaca buraları tanıtalım mı?',
    icon: Sparkles
  },
  {
    target: 'nav-links',
    title: 'Hızlı Navigasyon',
    content: 'Alışkanlıkların, analizlerin ve arkadaşların... Her şeye bu menüden anında ulaşabilirsin.',
    icon: Zap
  },
  {
    target: 'stat-cards',
    title: 'Performansın Bir Bakışta',
    content: 'Bugünkü ilerlemeni, en uzun serilerini ve toplam başarı oranını buradan takip edebilirsin.',
    icon: Zap
  },
  {
    target: 'today-habits',
    title: 'Günlük Takip',
    content: 'Tamamladığın alışkanlıkları buradan tek tıkla işaretle. Serini bozma, motivasyonunu koru!',
    icon: Zap
  },
  {
    target: 'ai-insights',
    title: 'AI İçgörüleri',
    content: 'Yapay zeka verilerini analiz eder ve sana özel stratejik öneriler sunar.',
    icon: Sparkles
  },
  {
    target: 'voice-coach',
    title: 'Senin AI Koçun',
    content: 'Bana istediğin zaman buradan ulaşabilirsin. Plan yaparız, dertleşiriz veya alışkanlık öneririm!',
    icon: Sparkles
  }
]

export default function SystemTour() {
  const [step, setStep] = useState(-1)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem('streakly_tour_completed')
    if (!completed) {
      setTimeout(() => {
        setStep(0)
        setVisible(true)
      }, 1500)
    }
  }, [])

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleComplete = () => {
    setVisible(false)
    localStorage.setItem('streakly_tour_completed', 'true')
  }

  if (!visible) return null

  const current = TOUR_STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#070d14]/60 backdrop-blur-[2px]"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`absolute pointer-events-auto glass-card p-8 w-[360px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] border border-white/10 ${
            current.target === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
            current.target === 'nav-links' ? 'top-28 left-1/2 -translate-x-1/2' :
            current.target === 'stat-cards' ? 'top-64 left-1/2 -translate-x-1/2' :
            current.target === 'today-habits' ? 'top-[450px] left-8' :
            current.target === 'ai-insights' ? 'top-[450px] right-8' :
            current.target === 'voice-coach' ? 'bottom-28 right-24' : 'top-1/2 left-1/2'
          }`}
          style={{ 
            background: 'rgba(18, 65, 112, 0.9)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Arrow Indicator (simplified for custom component) */}
          {current.target !== 'center' && (
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 border-l border-t border-white/10" style={{ background: 'rgba(18, 65, 112, 0.9)' }} />
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-green/20 border border-accent-green/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-glow-mint" />
            </div>
            <button onClick={handleComplete} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-tight">{current.title}</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">{current.content}</p>

          <div className="flex items-center justify-between gap-4 mt-auto">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-accent-green' : 'w-1.5 bg-white/10'}`} 
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button 
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-green text-[#070d14] font-bold text-sm hover:bg-glow-mint transition-all shadow-[0_8px_20px_rgba(103,192,144,0.3)]"
              >
                {step === TOUR_STEPS.length - 1 ? 'Başlayalım!' : 'Sonraki'}
                {step !== TOUR_STEPS.length - 1 && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
