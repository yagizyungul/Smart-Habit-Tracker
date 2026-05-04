import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Send, X, Square, Bot, User as UserIcon } from 'lucide-react'

const VOICES_TR = ['tr-TR', 'tr']

function speak(text, onEnd) {
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  const trVoice = voices.find((v) => VOICES_TR.some((l) => v.lang.startsWith(l)))
  if (trVoice) utter.voice = trVoice
  utter.lang = 'tr-TR'
  utter.rate = 1.05
  utter.pitch = 1
  if (onEnd) utter.onend = onEnd
  window.speechSynthesis.speak(utter)
}

export default function VoiceCoach() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ben Streakly AI Coach\'un. Alışkanlıkların hakkında soru sorabilir veya mikrofona basıp sesli konuşabilirsin. 🎯' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    window.speechSynthesis.getVoices()
  }, [])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }))
      const { data } = await api.post('/api/ai/chat', { message: text, history })
      const assistantMsg = { role: 'assistant', content: data.reply }
      setMessages((prev) => [...prev, assistantMsg])
      setSpeaking(true)
      speak(data.reply, () => setSpeaking(false))
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Bir hata oluştu, tekrar dener misin?' }])
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Tarayıcın ses tanımayı desteklemiyor. Chrome kullanmanı öneririm.')
      return
    }
    window.speechSynthesis.cancel()
    setSpeaking(false)

    const recognition = new SpeechRecognition()
    recognition.lang = 'tr-TR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      sendMessage(transcript)
    }
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const quickQuestions = [
    'Bu hafta nasıl gidiyorum?',
    'Hangi alışkanlığa odaklanmalıyım?',
    'Bugün neleri tamamlamadım?',
    'Streak\'imi nasıl koruyabilirim?',
  ]

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all overflow-hidden group"
        style={{ background: 'linear-gradient(135deg, #67C090, #AAFFC7)' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Bot className="w-8 h-8 text-[#124170]" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              className="absolute inset-0 bg-deep-ocean/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); window.speechSynthesis.cancel() }}
            />
            
            <motion.div 
              className="w-full max-w-lg glass-card flex flex-col relative overflow-hidden" 
              style={{ height: '640px', background: 'rgba(18, 65, 112, 0.9)', border: '1px solid rgba(170, 255, 199, 0.2)' }}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #215B63, #124170)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                    <Bot className="w-6 h-6 text-glow-mint" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm uppercase tracking-widest">Streakly AI Coach</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${speaking || listening ? 'bg-accent-green animate-pulse shadow-[0_0_8px_#67C090]' : 'bg-slate-500'}`} />
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        {speaking ? 'Sana cevap veriyor...' : listening ? 'Seni dinliyor...' : 'Seni izliyor'}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setOpen(false); window.speechSynthesis.cancel() }} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                      m.role === 'user' ? 'bg-accent-green/10 border-accent-green/20' : 'bg-white/5 border-white/10'
                    }`}>
                      {m.role === 'user' ? <UserIcon className="w-4 h-4 text-glow-mint" /> : <Bot className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div
                      className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-accent-green/20 text-glow-mint border border-accent-green/20'
                          : 'bg-white/5 text-slate-300 border border-white/5'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: '#f1f0ff', borderBottomLeftRadius: '4px' }}>
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t border-white/10 flex gap-4 items-center bg-white/5">
              <motion.button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  listening ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-accent-green/20 text-glow-mint'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mic className={`w-6 h-6 ${listening ? 'text-white' : ''}`} />
              </motion.button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Bir şeyler sor..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-green/40 transition-colors"
                disabled={loading || listening}
              />

              {speaking ? (
                <button
                  onClick={stopSpeaking}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-accent-green text-[#124170] disabled:opacity-20 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </>
  )
}
