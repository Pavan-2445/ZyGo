import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime, relativeTime } from '../../lib/format'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/SkeletonCard'

export default function HomePage() {
  const { user } = useAuth()
  const [rides, setRides] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [allRides, myBookings] = await Promise.all([api.listRides(), api.getMyBookings(user.id)])
        setRides(allRides)
        setBookings(myBookings)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const upcomingRides = useMemo(
    () => rides.filter((ride) => ride.driverId === user.id).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).slice(0, 3),
    [rides, user.id],
  )
  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-8 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 px-8 py-10 text-white lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Dashboard</p>
            <h1 className="mt-4 font-display text-5xl font-bold">Hi, {user.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">Plan your next shared trip, open seats for other travelers, and keep every booking flowing smoothly from request to payment.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search"><Button variant="accent">Search ride</Button></Link>
              <Link to="/offer-ride"><Button variant="secondary">Offer ride</Button></Link>
              <Link to="/bookings"><Button variant="secondary">View bookings</Button></Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            <Stat title="Current city" value={user.location} hint="From your verified profile" />
            <Stat title="Upcoming rides" value={String(upcomingRides.length)} hint="Trips you are offering" />
            <Stat title="Recent bookings" value={String(recentBookings.length)} hint="Requests and paid seats" />
          </div>
        </div>
      </Card>

      {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-semibold text-slate-950">Your upcoming rides</h2>
            <Link to="/offer-ride" className="text-sm font-semibold text-cyan-700">Create another</Link>
          </div>
          {loading && <><SkeletonCard /><SkeletonCard /></>}
          {!loading && upcomingRides.length === 0 && <EmptyState title="No rides offered yet" description="Publish your first intercity trip and start accepting passengers." />}
          {!loading && upcomingRides.map((ride) => (
            <Card key={ride.id} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold text-slate-950">{ride.source} to {ride.destination}</h3>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{ride.vehicleType}</span>
              </div>
              <p className="text-slate-600">{ride.route.join(' -> ')}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{formatDateTime(ride.dateTime)}</span>
                <span>{ride.seatsAvailable}/{ride.seatsTotal} seats left</span>
                <span>{relativeTime(ride.dateTime)}</span>
              </div>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-semibold text-slate-950">Recent bookings</h2>
            <Link to="/bookings" className="text-sm font-semibold text-cyan-700">Open bookings</Link>
          </div>
          {loading && <><SkeletonCard /><SkeletonCard /></>}
          {!loading && recentBookings.length === 0 && <EmptyState title="No bookings yet" description="Search for a ride and send your first booking request." />}
          {!loading && recentBookings.map((booking) => (
            <Card key={booking.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-slate-950">{booking.routeSummary}</h3>
                <span className="status-pill bg-slate-100 text-slate-700">{booking.status}</span>
              </div>
              <p className="text-slate-600">Driver: {booking.driverName}</p>
              <p className="text-sm text-slate-500">Traveling on {formatDateTime(booking.rideDateTime)}</p>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}

function Stat({ title, value, hint }) {
  return (
    <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.22em] text-white/60">{title}</p>
      <h3 className="mt-2 font-display text-3xl font-bold">{value}</h3>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </div>
  )
}
