import { useState, useRef, useEffect } from 'react'
import api from '../services/api'

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
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)' }}
        title="AI Coach ile konuş"
      >
        🎙️
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col" style={{ height: '580px' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'linear-gradient(135deg, #7F77DD, #5B52C7)', borderRadius: '16px 16px 0 0' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
                <div>
                  <div className="text-white font-semibold text-sm">Streakly AI Coach</div>
                  <div className="text-white/70 text-xs">{speaking ? '🔊 Konuşuyor...' : listening ? '🎤 Dinliyor...' : 'Çevrimiçi'}</div>
                </div>
              </div>
              <button onClick={() => { setOpen(false); window.speechSynthesis.cancel() }} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={m.role === 'user'
                      ? { background: '#7F77DD', color: 'white', borderBottomRightRadius: '4px' }
                      : { background: '#f1f0ff', color: '#1a1a2e', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {m.content}
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
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-purple-50"
                    style={{ borderColor: '#7F77DD', color: '#7F77DD' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t flex gap-2 items-center">
              {/* Mic Button */}
              <button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: listening ? '#EF4444' : '#f1f0ff',
                  color: listening ? 'white' : '#7F77DD',
                  transform: listening ? 'scale(1.15)' : 'scale(1)',
                }}
                title="Basılı tut ve konuş"
              >
                {listening ? '🔴' : '🎤'}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Mesaj yaz veya mikrofona bas..."
                className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
                style={{ borderColor: '#e2e0f9' }}
                disabled={loading || listening}
              />

              {/* Send / Stop Speaking */}
              {speaking ? (
                <button
                  onClick={stopSpeaking}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f1f0ff', color: '#7F77DD' }}
                  title="Sesi durdur"
                >
                  ⏹
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: '#7F77DD', color: 'white' }}
                >
                  ➤
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
