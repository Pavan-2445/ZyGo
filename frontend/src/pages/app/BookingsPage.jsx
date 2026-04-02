import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import BookingCard from '../../components/booking/BookingCard'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/SkeletonCard'

export default function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadBookings() {
    setLoading(true)
    setMessage('')
    const results = await Promise.allSettled([
      api.getIncomingBookings(user.id),
      api.getMyBookings(user.id),
    ])

    const [incomingResult, outgoingResult] = results

    if (incomingResult.status === 'fulfilled') {
      setIncoming(incomingResult.value)
    } else {
      setIncoming([])
      setMessage((current) => [current, incomingResult.reason.message].filter(Boolean).join(' '))
    }

    if (outgoingResult.status === 'fulfilled') {
      setOutgoing(outgoingResult.value)
    } else {
      setOutgoing([])
      setMessage((current) => [current, outgoingResult.reason.message].filter(Boolean).join(' '))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
    const interval = setInterval(loadBookings, 10000)
    return () => clearInterval(interval)
  }, [user.id])

  async function accept(bookingId) {
    try {
      await api.acceptBooking(bookingId, user.id)
      await loadBookings()
      setMessage('Passenger approved. Their seat is now confirmed for payment.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function reject(bookingId) {
    try {
      await api.rejectBooking(bookingId, user.id)
      await loadBookings()
      setMessage('Booking request rejected.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function cancel(bookingId) {
    try {
      const response = await api.cancelBooking(bookingId, user.id)
      await loadBookings()
      setMessage(response.message || 'Ride cancelled successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function pay(bookingId) {
    navigate(`/payment?bookingId=${bookingId}`)
  }

  const cancellableCount = outgoing.filter((booking) => booking.canCancel).length
  const lockedCount = outgoing.filter((booking) => ['REQUESTED', 'ACCEPTED', 'PAID'].includes(booking.status) && !booking.canCancel).length

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 px-6 py-7 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Bookings</p>
            <h1 className="mt-3 font-display text-4xl font-bold">Track approvals, countdowns, payments, and cancellation windows</h1>
            <p className="mt-3 max-w-2xl text-slate-200">Your bookings show how much time is left before departure, when cancellation is locked, and where to reach support if a refund is initiated.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <SummaryStat label="Incoming" value={incoming.length} detail="Pending requests to review" />
            <SummaryStat label="Can cancel" value={cancellableCount} detail="Still outside the 24h lock" />
            <SummaryStat label="Locked" value={lockedCount} detail="Within 24h of departure" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-950">Incoming requests</h2>
              <p className="text-slate-600">Approve or reject passengers for rides you are offering.</p>
            </div>
            <Button variant="secondary" onClick={loadBookings}>Refresh</Button>
          </div>
          {loading && <><SkeletonCard /><SkeletonCard /></>}
          {!loading && incoming.length === 0 && <EmptyState title="No incoming requests" description="When someone requests one of your rides, it will appear here automatically." />}
          {!loading && incoming.map((booking) => <BookingCard key={booking.id} booking={booking} driverActions onAccept={accept} onReject={reject} />)}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-950">Your bookings</h2>
            <p className="text-slate-600">Cancel anytime until 24 hours before the ride starts. Paid cancellations automatically show refund initiation and support contact.</p>
          </div>
          {loading && <><SkeletonCard /><SkeletonCard /></>}
          {!loading && outgoing.length === 0 && <EmptyState title="No bookings yet" description="Search rides and reserve a seat to begin your journey." />}
          {!loading && outgoing.map((booking) => <BookingCard key={booking.id} booking={booking} onPay={pay} onCancel={cancel} />)}
        </section>
      </div>

      {message && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{message}</p>}
    </div>
  )
}

function SummaryStat({ label, value, detail }) {
  return (
    <div className="rounded-[28px] bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-white/60">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/70">{detail}</div>
    </div>
  )
}
