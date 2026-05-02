import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/habits', label: 'Alışkanlıklar' },
  { to: '/analytics', label: 'Analitik' },
]

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 18 18 6M6 6l12 12',
    logout: 'M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5M14 21h5a2 2 0 0 0 2-2',
    spark: 'M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z',
  }

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-bold transition ${
      isActive ? 'bg-[#0B735F] text-white shadow-lg shadow-[#0B735F]/18' : 'text-[#384166] hover:bg-[#E3DBA9]/45 hover:text-[#0B735F]'
    }`

  return (
    <nav className="sticky top-0 z-30 border-b border-white/70 bg-[#F8F6E8]/82 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0B735F] text-[#0CDC2A] shadow-lg shadow-[#0B735F]/20">
              <Icon name="spark" className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight text-[#0B735F]">Streakly</span>
          </Link>

          <div className="hidden items-center rounded-lg border border-[#639D75]/20 bg-white/72 p-1 shadow-sm sm:flex">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="min-w-0 text-right">
                <div className="max-w-[150px] truncate text-sm font-black text-[#384166]">{user?.name}</div>
                <div className="text-xs font-medium text-[#639D75]">aktif oturum</div>
              </div>
              <button
                onClick={handleLogout}
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#639D75]/20 bg-white text-[#639D75] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Çıkış yap"
              >
                <Icon name="logout" className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#639D75]/20 bg-white text-[#0B735F] sm:hidden"
              aria-label="Menü"
            >
              <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {open && (
          <div className="sm:hidden pb-4">
            <div className="space-y-1 rounded-lg border border-[#639D75]/20 bg-white p-2 shadow-xl">
              {NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `${linkClass({ isActive })} block`}
                >
                  {label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
                Çıkış yap
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
