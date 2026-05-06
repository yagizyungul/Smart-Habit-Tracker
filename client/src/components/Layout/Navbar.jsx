import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Target, BarChart2, Sparkles, LogOut, Menu, X, Zap, Users, Timer, Moon, Sun } from 'lucide-react'
import NotificationsBell from '../NotificationsBell'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Alışkanlıklar', icon: Target },
  { to: '/focus', label: 'Odak', icon: Timer },
  { to: '/analytics', label: 'Analitik', icon: BarChart2 },
  { to: '/inspiration', label: 'İlham', icon: Sparkles },
  { to: '/friends', label: 'Arkadaşlar', icon: Users },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div 
          className="max-w-7xl mx-auto glass-card px-6 h-16 flex items-center justify-between"
          style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
        >

            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(170,255,199,0.5)]"
                style={{ background: 'linear-gradient(135deg, #67C090, #AAFFC7)' }}
              >
                <Zap className="w-5 h-5 text-[#124170]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white text-glow">
                Streakly
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <div id="nav-links" className="hidden sm:flex items-center gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? 'text-glow-mint bg-accent-green/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-glow-mint' : ''}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* User section */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-400 rounded-xl hover:bg-white/5 transition-all"
                title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationsBell />
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                title="Profil & Ayarlar"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#124170]"
                  style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--glow-mint))' }}
                >
                  {user?.avatarEmoji || initial}
                </div>
                <span className="text-sm font-medium text-slate-300">{user?.name}</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-500 rounded-xl transition-all duration-300 hover:text-red-400 hover:bg-red-400/10"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile section */}
            <div className="sm:hidden flex items-center gap-1">
              <NotificationsBell />
              <button
                onClick={() => setOpen(!open)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
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
            className="fixed top-24 left-4 right-4 z-50 sm:hidden glass-card p-4 overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: 'rgba(18, 65, 112, 0.95)', border: '1px solid rgba(170, 255, 199, 0.2)' }}
          >
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      isActive ? 'text-glow-mint bg-accent-green/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-glow-mint' : ''}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all border-t border-white/5 mt-2 pt-4"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#124170]"
                  style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--glow-mint))' }}
                >
                  {user?.avatarEmoji || initial}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{user?.name}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Profil & Ayarlar</div>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 w-full text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
