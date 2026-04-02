import { useMemo, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const initialRide = {
  source: 'Hyderabad',
  destination: 'Guntur',
  intermediateStops: 'Nalgonda',
  dateTime: '',
  vehicleType: 'CAR',
  seatsTotal: 3,
}

export default function CreateRidePage() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialRide)
  const [message, setMessage] = useState('')
  const route = useMemo(() => {
    const stops = form.intermediateStops
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    return [form.source, ...stops, form.destination].filter(Boolean)
  }, [form])

  async function submit(event) {
    event.preventDefault()
    if (!user) {
      setMessage('Login first so the ride can be linked to a driver profile.')
      return
    }

    try {
      const ride = await api.createRide({
        driverId: user.id,
        source: form.source,
        destination: form.destination,
        intermediateStops: route.slice(1, -1),
        route,
        dateTime: form.dateTime,
        vehicleType: form.vehicleType,
        seatsTotal: Number(form.seatsTotal),
      })
      setMessage(`Ride created. Price per seat: INR ${ride.pricePerSeat}`)
      setForm(initialRide)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="panel form-panel">
      <h2>Offer a scheduled ride</h2>
      <form className="stack-form" onSubmit={submit}>
        <div className="form-row">
          <input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
          <input placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        </div>
        <input placeholder="Intermediate stops, comma separated" value={form.intermediateStops} onChange={(e) => setForm({ ...form, intermediateStops: e.target.value })} />
        <div className="form-row">
          <input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
          <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
            <option value="BIKE">Bike</option>
            <option value="CAR">Car</option>
            <option value="SUV">SUV</option>
          </select>
          <input type="number" min="1" value={form.seatsTotal} onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })} required />
        </div>
        <div className="route-preview">Route preview: {route.join(' -> ')}</div>
        <button className="primary-button">Create ride</button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </section>
  )
}
