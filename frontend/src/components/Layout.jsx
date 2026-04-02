import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="hero-bar">
        <div>
          <Link to="/" className="brand">ZyGo</Link>
          <p className="tagline">Scheduled intercity ride-sharing for drivers and passengers.</p>
        </div>
        <div className="hero-actions">
          {user ? (
            <>
              <div className="user-chip">
                <strong>{user.name}</strong>
                <span>{user.location}</span>
              </div>
              <button className="secondary-button" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className="secondary-button">Login / Register</Link>
          )}
        </div>
      </header>
      <nav className="nav-row">
        <NavLink to="/search">Search Rides</NavLink>
        <NavLink to="/offer">Offer Ride</NavLink>
        <NavLink to="/bookings">Bookings</NavLink>
      </nav>
      <main>{children}</main>
    </div>
  )
}
