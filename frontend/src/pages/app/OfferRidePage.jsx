import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import RouteMap, { getRoutePreviewMetrics } from '../../components/maps/RouteMap'
import { formatCurrency } from '../../lib/format'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const vehicleMultipliers = {
  BIKE: 1.0,
  CAR: 1.5,
  SUV: 2.0,
}

const baseRate = 4.5

export default function OfferRidePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    source: 'Hyderabad',
    destination: 'Guntur',
    stopInput: '',
    stops: ['Nalgonda'],
    dateTime: '',
    vehicleType: 'CAR',
    seatsTotal: 3,
    customPriceEnabled: false,
    customPrice: '',
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const route = useMemo(
    () => [form.source.trim(), ...form.stops.map((stop) => stop.trim()).filter(Boolean), form.destination.trim()].filter(Boolean),
    [form.source, form.stops, form.destination],
  )

  const previewMetrics = useMemo(() => getRoutePreviewMetrics(route), [route])
  const calculatedPrice = useMemo(() => {
    const seats = Number(form.seatsTotal) || 1
    const multiplier = vehicleMultipliers[form.vehicleType] || 1
    return (previewMetrics.totalDistance * baseRate * multiplier) / seats
  }, [previewMetrics.totalDistance, form.vehicleType, form.seatsTotal])
  const effectivePrice = form.customPriceEnabled && form.customPrice ? Number(form.customPrice) : calculatedPrice

  function addStopsFromInput() {
    const parsedStops = form.stopInput
      .split(/,|\n/)
      .map((value) => value.trim())
      .filter(Boolean)

    if (!parsedStops.length) {
      return
    }

    setForm((current) => ({
      ...current,
      stops: [...current.stops, ...parsedStops].filter((stop, index, array) => array.findIndex((item) => item.toLowerCase() === stop.toLowerCase()) === index),
      stopInput: '',
    }))
  }

  function removeStop(stopToRemove) {
    setForm((current) => ({
      ...current,
      stops: current.stops.filter((stop) => stop !== stopToRemove),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const ride = await api.createRide({
        driverId: user.id,
        source: form.source,
        destination: form.destination,
        intermediateStops: form.stops,
        route,
        dateTime: form.dateTime,
        vehicleType: form.vehicleType,
        seatsTotal: Number(form.seatsTotal),
        pricePerSeatOverride: form.customPriceEnabled && form.customPrice ? Number(form.customPrice) : null,
      })
      navigate(`/ride/${ride.id}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Offer a ride</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-950">Publish your next trip</h1>
          <p className="mt-3 text-slate-600">Add stops one by one, preview the route, and either keep the calculated seat price or set your own custom price.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
            <Input label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="field-label">Intermediate stops</span>
              <div className="flex gap-3">
                <input
                  className="field-input"
                  placeholder="Type a stop and press Add or Enter"
                  value={form.stopInput}
                  onChange={(e) => setForm({ ...form, stopInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addStopsFromInput()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addStopsFromInput}>Add</Button>
              </div>
            </label>
            {form.stops.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.stops.map((stop) => (
                  <button
                    key={stop}
                    type="button"
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    onClick={() => removeStop(stop)}
                    title="Remove stop"
                  >
                    {stop} x
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Departure date & time" type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
            <Select label="Vehicle type" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
              <option value="BIKE">Bike</option>
              <option value="CAR">Car</option>
              <option value="SUV">SUV</option>
            </Select>
            <Input label="Seats" type="number" min="1" value={form.seatsTotal} onChange={(e) => setForm({ ...form, seatsTotal: e.target.value })} required />
          </div>

          <div className="space-y-4 rounded-[28px] bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <div>Route order used for matching: {route.join(' -> ')}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Approx distance</div>
                <div className="mt-1 text-base font-semibold text-slate-900">{previewMetrics.totalDistance.toFixed(1)} km</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Auto price per seat</div>
                <div className="mt-1 text-base font-semibold text-slate-900">{formatCurrency(calculatedPrice)}</div>
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={form.customPriceEnabled}
                onChange={(e) => setForm({ ...form, customPriceEnabled: e.target.checked, customPrice: e.target.checked ? form.customPrice : '' })}
              />
              <span className="font-medium text-slate-800">Let me set my own price per seat</span>
            </label>
            {form.customPriceEnabled && (
              <Input
                label="Custom price per seat"
                type="number"
                min="1"
                step="0.01"
                value={form.customPrice}
                onChange={(e) => setForm({ ...form, customPrice: e.target.value })}
              />
            )}
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Final price that will be saved</div>
              <div className="mt-1 text-lg font-bold text-orange-700">{formatCurrency(effectivePrice || 0)}</div>
            </div>
          </div>

          <Button variant="accent" className="w-full" disabled={loading}>{loading ? 'Creating ride...' : 'Create ride'}</Button>
        </form>
        {message && <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
      </Card>
      <div className="space-y-6">
        <RouteMap route={route} height="420px" />
        <Card>
          <h2 className="font-display text-2xl font-semibold text-slate-950">Why this feels smoother now</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Intermediate stops are added explicitly, which avoids parsing glitches from one long comma-separated input.</li>
            <li>You get a live distance and price preview before publishing the ride.</li>
            <li>If the auto price is not what you want, you can enable a manual override and save your own seat price.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
