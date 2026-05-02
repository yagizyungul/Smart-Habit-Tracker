import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/habits', label: 'Alışkanlıklar' },
  { to: '/analytics', label: 'Analitik' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-[#EEEDFE] text-[#534AB7]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/dashboard" className="text-[#534AB7] font-bold text-lg tracking-tight">
            Streakly
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500 max-w-[120px] truncate">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="hidden sm:block text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Çıkış
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Menü"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="sm:hidden border-t border-gray-100 py-2 space-y-0.5">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => linkClass({ isActive }) + ' block'}
              >
                {label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between px-3 pt-2 mt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
