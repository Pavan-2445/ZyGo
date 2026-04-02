import { formatCountdown, formatCurrency, formatDateTime, isWithinHours } from '../../lib/format'
import StatusBadge from './StatusBadge'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function BookingCard({ booking, driverActions = false, onAccept, onReject, onPay, onCancel }) {
  const within24Hours = isWithinHours(booking.rideDateTime, 24)
  const showCancel = !driverActions && ['REQUESTED', 'ACCEPTED', 'PAID'].includes(booking.status)
  const disableCancel = within24Hours || !booking.canCancel

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">Booking #{booking.id.slice(-6)}</div>
          <h3 className="mt-2 font-display text-xl font-semibold text-slate-950">{booking.routeSummary}</h3>
          <p className="mt-2 text-sm text-slate-600">{driverActions ? `Passenger: ${booking.passengerName}` : `Driver: ${booking.driverName}`}</p>
        </div>
        <div className="space-y-2 text-right">
          <StatusBadge status={booking.status} />
          <div className="rounded-2xl bg-cyan-50 px-3 py-2 text-xs text-cyan-700">
            <div className="uppercase tracking-[0.2em] text-cyan-500">Time left</div>
            <div className="mt-1 text-sm font-semibold text-cyan-700">{formatCountdown(booking.rideDateTime)}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Travel time" value={formatDateTime(booking.rideDateTime)} />
        <Metric label="Price" value={formatCurrency(booking.pricePerSeat)} />
        <Metric label="Seats left" value={String(booking.seatsAvailable)} />
        <Metric label="Support" value={booking.supportEmail} />
      </div>
      <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{booking.route.join(' -> ')}</div>

      {!driverActions && booking.refundInitiated && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Refund initiated for this cancelled ride. For updates, contact {booking.supportEmail}.
        </div>
      )}

      {!driverActions && showCancel && disableCancel && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Cancellation is locked within 24 hours of ride start. Contact {booking.supportEmail} if you need help urgently.
        </div>
      )}

      {!driverActions && booking.status === 'CANCELLED' && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {booking.refundNote || `This ride was cancelled. Contact ${booking.supportEmail} for help.`}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {driverActions && booking.status === 'REQUESTED' && (
          <>
            <Button variant="accent" onClick={() => onAccept(booking.id)}>Accept</Button>
            <Button variant="secondary" onClick={() => onReject(booking.id)}>Reject</Button>
          </>
        )}
        {!driverActions && booking.status === 'ACCEPTED' && <Button variant="accent" onClick={() => onPay(booking.id)}>Continue to payment</Button>}
        {!driverActions && showCancel && (
          <Button variant="danger" disabled={disableCancel} onClick={() => onCancel(booking.id)}>
            Cancel ride
          </Button>
        )}
      </div>
    </Card>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
