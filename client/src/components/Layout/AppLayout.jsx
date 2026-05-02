import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="botanic-bg min-h-screen overflow-hidden text-[#384166]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <span className="leaf left-10 top-28 opacity-35" />
        <span className="leaf leaf-soft right-12 top-52 opacity-45 [animation-delay:1.2s]" />
      </div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
