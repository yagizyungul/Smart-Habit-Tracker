import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataCacheProvider } from './context/DataCacheContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import HabitDetail from './pages/HabitDetail'
import Analytics from './pages/Analytics'
import Inspiration from './pages/Inspiration'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Friends from './pages/Friends'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DataCacheProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/habits/:id" element={<HabitDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/inspiration" element={<Inspiration />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </DataCacheProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
