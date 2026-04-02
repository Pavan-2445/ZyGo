import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function BookingPage() {
  const { user } = useAuth()
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [message, setMessage] = useState('')

  async function refresh() {
    if (!user) return
    try {
      const [incomingData, outgoingData] = await Promise.all([
        api.getIncomingBookings(user.id),
        api.getMyBookings(user.id),
      ])
      setIncoming(incomingData)
      setOutgoing(outgoingData)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    refresh()
  }, [user])

  async function handleDriverAction(bookingId, action) {
    try {
      if (action === 'accept') {
        await api.acceptBooking(bookingId, user.id)
      } else {
        await api.rejectBooking(bookingId, user.id)
      }
      setMessage(`Booking ${action}ed successfully.`)
      refresh()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function payForBooking(bookingId) {
    try {
      const payment = await api.createPaymentIntent({ bookingId, passengerId: user.id })
      await api.confirmPayment(payment.id, user.id)
      setMessage(`Payment completed for booking #${bookingId}.`)
      refresh()
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (!user) {
    return <section className="panel"><p>Login to view ride requests, approvals, and payment actions.</p></section>
  }

  return (
    <div className="page-grid two-columns">
      <section className="panel">
        <h2>Incoming requests as driver</h2>
        <div className="cards-grid compact">
          {incoming.map((booking) => (
            <article className="ride-card" key={booking.id}>
              <h3>{booking.routeSummary}</h3>
              <p>Passenger: {booking.passengerName}</p>
              <p>Status: {booking.status}</p>
              {booking.status === 'REQUESTED' && (
                <div className="button-row">
                  <button className="primary-button" onClick={() => handleDriverAction(booking.id, 'accept')}>Accept</button>
                  <button className="secondary-button" onClick={() => handleDriverAction(booking.id, 'reject')}>Reject</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>My bookings as passenger</h2>
        <div className="cards-grid compact">
          {outgoing.map((booking) => (
            <article className="ride-card" key={booking.id}>
              <h3>{booking.routeSummary}</h3>
              <p>Driver: {booking.driverName}</p>
              <p>Status: {booking.status}</p>
              {booking.status === 'ACCEPTED' && (
                <button className="primary-button" onClick={() => payForBooking(booking.id)}>Pay now</button>
              )}
            </article>
          ))}
        </div>
      </section>
      {message && <p className="form-message">{message}</p>}
    </div>
  )
}
