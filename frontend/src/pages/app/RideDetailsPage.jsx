import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDateTime } from '../../lib/format'
import RouteMap from '../../components/maps/RouteMap'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SkeletonCard from '../../components/ui/SkeletonCard'

export default function RideDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRide() {
      try {
        const data = await api.getRide(id)
        setRide(data)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadRide()
  }, [id])

  async function requestBooking() {
    try {
      await api.requestBooking({ rideId: id, passengerId: user.id })
      navigate('/bookings')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (loading) {
    return <SkeletonCard />
  }

  if (!ride) {
    return <Card>{message || 'Ride not found.'}</Card>
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <Card className="space-y-5 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Ride details</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-slate-950">{ride.source} to {ride.destination}</h1>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">{formatCurrency(ride.pricePerSeat)} / seat</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Metric label="Driver" value={ride.driverName} />
            <Metric label="Vehicle" value={ride.vehicleType} />
            <Metric label="Departure" value={formatDateTime(ride.dateTime)} />
            <Metric label="Seats" value={`${ride.seatsAvailable}/${ride.seatsTotal}`} />
            <Metric label="Distance" value={`${ride.distanceKm} km`} />
            <Metric label="Duration" value={`${ride.durationMinutes ?? 0} mins`} />
          </div>
          <div className="rounded-[28px] bg-slate-50 px-5 py-4 text-sm text-slate-600">{ride.route.join(' -> ')}</div>
          {ride.driverId !== user.id && <Button variant="accent" onClick={requestBooking}>Request this ride</Button>}
          {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
        </Card>
      </div>
      <RouteMap route={ride.route} height="560px" />
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  )
}
