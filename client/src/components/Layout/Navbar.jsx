import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Target, BarChart2, Sparkles, LogOut, Menu, X, Zap } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Alışkanlıklar', icon: Target },
  { to: '/analytics', label: 'Analitik', icon: BarChart2 },
  { to: '/inspiration', label: 'İlham', icon: Sparkles },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(6, 6, 15, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_18px_rgba(139,92,246,0.55)]"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-display" style={{
                background: 'linear-gradient(135deg, #A78BFA, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Streakly
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-violet-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'rgba(139,92,246,0.12)',
                    boxShadow: '0 0 0 1px rgba(139,92,246,0.28)',
                  } : {}}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* User section */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-violet-300"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.2))' }}
                >
                  {initial}
                </div>
                <span className="text-sm text-slate-400 max-w-[90px] truncate">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 rounded-lg transition-all duration-200 hover:text-red-400"
                style={{ ':hover': { background: 'rgba(239,68,68,0.1)' } }}
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
              style={{ ':hover': { background: 'rgba(255,255,255,0.06)' } }}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-16 left-0 right-0 z-30 sm:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(14,14,26,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'text-violet-300' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: 'rgba(139,92,246,0.12)' } : {}}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
              <div className="flex items-center justify-between px-3 py-3 mt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-violet-300"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.2))' }}
                  >
                    {initial}
                  </div>
                  <span className="text-sm text-slate-400">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Çıkış
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
