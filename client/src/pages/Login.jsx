import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthVisual() {
  return (
    <div className="relative hidden min-h-[640px] overflow-hidden rounded-[2rem] bg-[#0B735F] p-8 text-white shadow-[0_30px_100px_rgba(11,115,95,0.35)] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(12,220,42,0.38),transparent_26%),radial-gradient(circle_at_72%_68%,rgba(227,219,169,0.3),transparent_30%),linear-gradient(145deg,#0B735F_0%,#384166_100%)]" />
      <span className="leaf left-12 top-24" />
      <span className="leaf leaf-soft right-10 top-44 [animation-delay:1.5s]" />
      <span className="leaf bottom-20 left-24 scale-125 [animation-delay:2.4s]" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0CDC2A] pulse-sprout" />
            canlı alışkanlık bahçesi
          </div>
          <h1 className="mt-8 max-w-md text-6xl font-black leading-[0.95] tracking-tight">
            Serini büyüt. Gününü yeşert.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-[#E3DBA9]">
            Streakly her tamamlanan alışkanlığı küçük bir filize dönüştürür; ritmin görünür, motivasyonun canlı kalır.
          </p>
        </div>

        <div className="grid gap-4">
          {[
            ['Sabah yürüyüşü', '86%', '#0CDC2A'],
            ['Su içme', '72%', '#E3DBA9'],
            ['Kitap okuma', '94%', '#639D75'],
          ].map(([title, pct, color]) => (
            <div key={title} className="rounded-2xl border border-white/18 bg-white/12 p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between text-sm font-bold">
                <span>{title}</span>
                <span style={{ color }}>{pct}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="grow-bar h-full rounded-full" style={{ width: pct, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="botanic-bg relative min-h-screen overflow-hidden px-4 py-8">
      <span className="leaf -left-8 top-16 lg:hidden" />
      <span className="leaf leaf-soft -right-10 bottom-24 lg:hidden" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <AuthVisual />

        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B735F] text-[#0CDC2A] shadow-xl shadow-[#0B735F]/25">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10Z" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#0B735F]">Streakly</div>
                <p className="text-sm font-semibold text-[#639D75]">Alışkanlıklarını takip et, serini büyüt.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_26px_80px_rgba(56,65,102,0.16)] backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#639D75]">tekrar hoş geldin</p>
              <h1 className="mt-2 text-3xl font-black text-[#384166]">Giriş yap</h1>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-[#384166]">E-posta</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-2xl border border-[#639D75]/25 bg-[#F9F7EA] px-4 py-3 text-sm font-semibold text-[#384166] outline-none transition focus:border-[#0B735F] focus:ring-4 focus:ring-[#0CDC2A]/18"
                  placeholder="ornek@mail.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black text-[#384166]">Şifre</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-2xl border border-[#639D75]/25 bg-[#F9F7EA] px-4 py-3 text-sm font-semibold text-[#384166] outline-none transition focus:border-[#0B735F] focus:ring-4 focus:ring-[#0CDC2A]/18"
                  placeholder="Şifrenizi girin"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-[#0B735F] px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-[#0B735F]/25 transition hover:-translate-y-0.5 hover:bg-[#095f50] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-semibold text-[#639D75]">
              Hesabın yok mu?{' '}
              <Link to="/register" className="font-black text-[#0B735F] hover:text-[#0CDC2A]">
                Kayıt ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
