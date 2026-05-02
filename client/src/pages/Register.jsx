import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (form.name.trim().length < 2) return 'İsim en az 2 karakter olmalı'
    if (form.password.length < 8) return 'Şifre en az 8 karakter olmalı'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="botanic-bg relative min-h-screen overflow-hidden px-4 py-8">
      <span className="leaf left-8 top-16" />
      <span className="leaf leaf-soft right-10 bottom-16 [animation-delay:1.8s]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_26px_80px_rgba(56,65,102,0.16)] backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <Link to="/login" className="mb-7 inline-flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B735F] text-[#0CDC2A] shadow-xl shadow-[#0B735F]/25">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10Z" />
                </svg>
              </div>
              <span className="text-3xl font-black text-[#0B735F]">Streakly</span>
            </Link>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#639D75]">yeni bahçe</p>
            <h1 className="mt-2 text-3xl font-black text-[#384166]">Hesap oluştur</h1>
            <p className="mt-2 text-sm font-semibold text-[#639D75]">İlk adımı at, alışkanlığını görünür bir seriye dönüştür.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['name', 'Ad Soyad', 'Adın ve soyadın', 'text'],
              ['email', 'E-posta', 'ornek@mail.com', 'email'],
              ['password', 'Şifre', 'En az 8 karakter', 'password'],
            ].map(([key, label, placeholder, type]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-black text-[#384166]">{label}</label>
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-2xl border border-[#639D75]/25 bg-[#F9F7EA] px-4 py-3 text-sm font-semibold text-[#384166] outline-none transition focus:border-[#0B735F] focus:ring-4 focus:ring-[#0CDC2A]/18"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#0B735F] px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-[#0B735F]/25 transition hover:-translate-y-0.5 hover:bg-[#095f50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Kayıt ol'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[#639D75]">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="font-black text-[#0B735F] hover:text-[#0CDC2A]">
              Giriş yap
            </Link>
          </p>
        </div>

        <div className="relative hidden min-h-[600px] overflow-hidden rounded-[2rem] bg-[#384166] p-8 text-white shadow-[0_30px_100px_rgba(56,65,102,0.28)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_25%,rgba(12,220,42,0.28),transparent_26%),radial-gradient(circle_at_74%_72%,rgba(227,219,169,0.3),transparent_30%),linear-gradient(145deg,#384166_0%,#0B735F_100%)]" />
          <span className="leaf right-16 top-20" />
          <span className="leaf leaf-soft left-16 bottom-20 [animation-delay:1.5s]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-[#E3DBA9] px-4 py-2 text-sm font-black text-[#0B735F]">7 günlük başlangıç planı</div>
              <h2 className="mt-8 max-w-lg text-6xl font-black leading-[0.95] tracking-tight">Yeni rutinler için canlı bir alan.</h2>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-2xl border border-white/12"
                  style={{ backgroundColor: i % 5 === 0 ? '#0CDC2A' : i % 3 === 0 ? '#639D75' : 'rgba(255,255,255,0.12)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
