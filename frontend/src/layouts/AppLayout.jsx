import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/offer-ride', label: 'Offer Ride' },
  { to: '/bookings', label: 'Bookings' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <NavLink to="/home" className="font-display text-3xl font-bold text-slate-950">ZyGo</NavLink>
            <p className="mt-1 text-sm text-slate-600">Premium intercity ride-sharing for modern commuters.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-2 text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</div>
              <div className="font-semibold text-slate-900">{user?.name}</div>
            </div>
            <Button variant="secondary" onClick={logout}>Logout</Button>
          </div>
        </motion.header>
        <Outlet />
      </div>
    </div>
  )
}
