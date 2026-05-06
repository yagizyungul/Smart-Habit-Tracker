import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Send, X, Square, Bot, User as UserIcon, Plus, Check, Sparkles } from 'lucide-react'

function speak(text, onEnd) {
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  
  // En iyi Türkçe sesi bulmaya çalışalım (Google veya Microsoft'un doğal sesleri)
  const preferredTrVoices = [
    'Google Türkçe',
    'Microsoft Tolga Online',
    'Microsoft Yelda Online',
    'Microsoft Tolga',
    'Microsoft Yelda',
    'Turkish Turkey'
  ]
  
  let selectedVoice = voices.find(v => v.lang.startsWith('tr') && preferredTrVoices.some(p => v.name.includes(p)))
  if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('tr'))
  
  if (selectedVoice) {
    utter.voice = selectedVoice
    utter.lang = 'tr-TR'
  } else {
    // İngilizce ise
    const enVoice = voices.find(v => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice
    utter.lang = 'en-US'
  }
  
  utter.rate = 0.95 // Biraz daha sakin ve anlaşılır hız
  utter.pitch = 1.05 // Hafif daha enerjik ton
  utter.volume = 1
  
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
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }))
      const { data } = await api.post('/api/ai/chat', { message: text, history })
      
      const assistantMsg = { 
        role: 'assistant', 
        content: data.reply,
        suggestion: data.suggestion 
      }
      setMessages((prev) => [...prev, assistantMsg])
      
      if (data.reply) speak(data.reply, () => setSpeaking(false))
      setSpeaking(true)
    } catch (err) {
      const status = err?.response?.status
      if (status === 429) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: '⏳ Çok fazla istek gönderildi. Gemini AI sınırına ulaşıldı. 15 saniye bekleyip tekrar dene.'
        }])
        // 15 saniye boyunca input'u kilitli tut
        await new Promise((r) => setTimeout(r, 15000))
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Bir hata oluştu, tekrar dener misin?' }])
      }
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
    // Konuşmayı yakalarken çok dilli destek zor olduğu için 
    // tarayıcının varsayılanını kullanmasına veya global bir dil tespiti yapmasına izin veriyoruz.
    // Şimdilik ana dil olan Türkçe kalsın ama İngilizce'yi de anlar.
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
    'Haftalık planımı yap',
    'Zorlandığım günleri analiz et',
    'Yeni bir alışkanlık önerir misin?',
    'Performans özetimi ver',
  ]

  const handleAcceptSuggestion = async (sug, msgIdx) => {
    if (sug.type === 'add_habit') {
      try {
        setLoading(true)
        await api.post('/api/habits', sug.habit)
        // Mesajı güncelle ki buton kaybolsun veya "Eklendi" yazsın
        const newMessages = [...messages]
        newMessages[msgIdx].suggestionApplied = true
        newMessages[msgIdx].content += "\n\n✅ Alışkanlık başarıyla eklendi!"
        setMessages(newMessages)
      } catch (err) {
        alert('Alışkanlık eklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <motion.button
        onClick={() => { setOpen((o) => !o); if(open) window.speechSynthesis.cancel() }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(103,192,144,0.35)] flex items-center justify-center text-[#070d14] transition-all group"
        style={{ background: 'linear-gradient(135deg, #67C090, #AAFFC7)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div 
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] flex flex-col overflow-hidden rounded-[24px]" 
            style={{ 
              height: '650px', 
              maxHeight: 'calc(100vh - 120px)',
              background: 'rgba(11, 20, 33, 0.85)', 
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(170, 255, 199, 0.12)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 relative shrink-0 border-b border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-[#215B63]/20 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#67C090]/20 to-transparent border border-[#67C090]/30 shadow-[0_0_15px_rgba(103,192,144,0.15)]">
                    <Bot className="w-6 h-6 text-[#AAFFC7]" />
                  </div>
                  {(speaking || listening) && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#AAFFC7] rounded-full animate-pulse shadow-[0_0_12px_#AAFFC7] border-2 border-[#0b1421]" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] tracking-wide flex items-center gap-2">
                    Streakly AI
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">Beta</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {speaking ? 'Sana yanıt veriyor...' : listening ? 'Seni dinliyor...' : 'Sana yardım etmeye hazır'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide relative" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/5 mt-auto">
                        <Bot className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm ${
                        m.role === 'user'
                          ? 'text-[#070d14] font-semibold rounded-br-sm'
                          : 'text-slate-200 font-normal rounded-bl-sm border border-white/5'
                      }`}
                      style={m.role === 'user'
                        ? { background: 'linear-gradient(135deg, #AAFFC7, #67C090)' }
                        : { background: 'rgba(255,255,255,0.06)' }
                      }
                    >
                      <div className="flex flex-col gap-3">
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        
                        {m.suggestion && !m.suggestionApplied && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 p-4 rounded-xl bg-white/10 border border-white/10 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#AAFFC7] uppercase tracking-widest">
                              <Sparkles size={12} />
                              AI Önerisi
                            </div>
                            
                            {m.suggestion.type === 'add_habit' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.suggestion.habit.color }}>
                                    <Plus size={16} className="text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-white">{m.suggestion.habit.title}</div>
                                    <div className="text-[10px] text-slate-400 capitalize">{m.suggestion.habit.frequency}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAcceptSuggestion(m.suggestion, i)}
                                  className="w-full py-2 rounded-lg bg-[#67C090] text-[#070d14] text-xs font-bold hover:bg-[#AAFFC7] transition-colors flex items-center justify-center gap-2"
                                >
                                  <Check size={14} />
                                  Alışkanlığı Listeme Ekle
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] items-end">
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/5">
                      <Bot className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm px-5 py-4 bg-white/5 border border-white/5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-5 pb-3 pt-2 flex flex-col gap-2 shrink-0 bg-gradient-to-t from-[#0b1421] to-transparent relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1">Önerilen Sorular</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[11px] font-medium px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 transition-all hover:bg-white/10 hover:text-white text-left leading-tight"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-5 border-t border-white/5 bg-[#0b1421]/90 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={listening ? stopListening : startListening}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    listening ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mic className="w-5 h-5" />
                </motion.button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Streakly'ye sor..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#67C090]/50 focus:bg-white/10 transition-all"
                    disabled={loading || listening}
                  />
                </div>

                {speaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <motion.button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:grayscale transition-all bg-[#67C090] text-[#0b1421] hover:bg-[#AAFFC7]"
                    whileHover={input.trim() && !loading ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && !loading ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
