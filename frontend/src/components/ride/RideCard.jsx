import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../lib/format'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function RideCard({ ride, onRequest }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.18 }}>
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">{ride.vehicleType}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">{ride.source} to {ride.destination}</h3>
          </div>
          <div className="rounded-2xl bg-orange-50 px-3 py-2 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Per seat</div>
            <div className="text-lg font-bold text-orange-700">{formatCurrency(ride.pricePerSeat)}</div>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {ride.route.join(' -> ')}
        </div>
        <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
          <span>Driver: <strong className="text-slate-900">{ride.driverName}</strong></span>
          <span>Departure: <strong className="text-slate-900">{formatDateTime(ride.dateTime)}</strong></span>
          <span>Seats left: <strong className="text-slate-900">{ride.seatsAvailable}/{ride.seatsTotal}</strong></span>
          <span>Distance: <strong className="text-slate-900">{ride.distanceKm} km</strong></span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/ride/${ride.id}`}><Button variant="secondary">View details</Button></Link>
          {onRequest && <Button variant="accent" onClick={() => onRequest(ride.id)}>Request seat</Button>}
        </div>
      </Card>
    </motion.div>
  )
}
