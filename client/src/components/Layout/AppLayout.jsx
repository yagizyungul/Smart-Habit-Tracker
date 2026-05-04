import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import VoiceCoach from '../VoiceCoach'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-base relative">
      {/* Ambient gradient orbs — fixed behind everything */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full animate-float-slower"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.03) 0%, transparent 70%)' }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Outlet />
      </main>

      <VoiceCoach />
    </div>
  )
}
