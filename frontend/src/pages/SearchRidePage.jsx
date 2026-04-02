import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function SearchRidePage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ source: 'Hyderabad', destination: 'Guntur' })
  const [rides, setRides] = useState([])
  const [message, setMessage] = useState('')

  async function loadRides() {
    try {
      const results = await api.searchRides(filters.source, filters.destination)
      setRides(results)
      setMessage(results.length ? '' : 'No matching rides found for this route.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadRides()
  }, [])

  async function requestBooking(rideId) {
    if (!user) {
      setMessage('Login as a passenger before requesting a booking.')
      return
    }
    try {
      await api.requestBooking({ rideId, passengerId: user.id })
      setMessage('Booking request sent to the driver.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Search rides</h2>
          <p>Matching requires the source stop to appear before the destination stop in the stored route.</p>
        </div>
        <form className="search-bar" onSubmit={(e) => { e.preventDefault(); loadRides() }}>
          <input value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} placeholder="Source" />
          <input value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })} placeholder="Destination" />
          <button className="primary-button">Search</button>
        </form>
      </div>
      <div className="cards-grid">
        {rides.map((ride) => (
          <article className="ride-card" key={ride.id}>
            <div className="ride-card-top">
              <h3>{ride.source} to {ride.destination}</h3>
              <span>{ride.vehicleType}</span>
            </div>
            <p>{ride.route.join(' -> ')}</p>
            <div className="ride-meta">
              <span>Driver: {ride.driverName}</span>
              <span>Seats left: {ride.seatsAvailable}/{ride.seatsTotal}</span>
              <span>Distance: {ride.distanceKm} km</span>
              <span>Price/seat: INR {ride.pricePerSeat}</span>
            </div>
            <button className="secondary-button" onClick={() => requestBooking(ride.id)}>Request booking</button>
          </article>
        ))}
      </div>
      {message && <p className="form-message">{message}</p>}
    </section>
  )
}
