import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SkeletonCard from '../../components/ui/SkeletonCard'
import { formatCurrency } from '../../lib/format'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'))
    document.body.appendChild(script)
  })
}

export default function PaymentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [payment, setPayment] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function preparePayment() {
      if (!bookingId) {
        setMessage('A bookingId is required to open the payment page.')
        setLoading(false)
        return
      }

      try {
        const bookingData = await api.getBooking(bookingId)
        setBooking(bookingData)
        const paymentData = await api.createPaymentIntent({ bookingId, passengerId: user.id })
        setPayment(paymentData)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    preparePayment()
  }, [bookingId, user.id])

  async function openCheckout() {
    if (!payment || !booking) return
    setMessage('')

    try {
      if (payment.providerOrderId?.startsWith('mock_order_') || payment.publicKey === 'mock_key_id') {
        await api.confirmPayment(payment.id, {
          passengerId: user.id,
          razorpayPaymentId: 'mock_payment_id',
          razorpayOrderId: payment.providerOrderId,
          razorpaySignature: 'mock_signature',
        })
        navigate('/bookings')
        return
      }

      const Razorpay = await loadRazorpayScript()
      const key = payment.publicKey

      if (!key) {
        throw new Error('Razorpay key is missing from the backend payment response.')
      }

      const instance = new Razorpay({
        key,
        amount: Math.round(Number(payment.amount) * 100),
        currency: payment.currency || 'INR',
        name: 'ZyGo RideShare',
        description: booking.routeSummary,
        order_id: payment.providerOrderId,
        handler: async (response) => {
          try {
            await api.confirmPayment(payment.id, {
              passengerId: user.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            })
            navigate('/bookings')
          } catch (error) {
            setMessage(error.message)
          }
        },
        prefill: {
          name: user.name,
          contact: user.phone,
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: () => setMessage('Razorpay checkout was closed before completing payment.'),
        },
      })

      instance.on('payment.failed', (response) => {
        const reason = response?.error?.description || response?.error?.reason || 'Payment failed in Razorpay checkout.'
        setMessage(reason)
      })

      instance.open()
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (loading) return <SkeletonCard />

  if (!payment || !booking) {
    return <Card className="text-sm text-rose-700">{message || 'Payment could not be initialized.'}</Card>
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Payment</p>
        <h1 className="font-display text-4xl font-bold text-slate-950">Pay with Razorpay</h1>
        <p className="text-slate-600">Your seat is reserved only after the driver accepts and the Razorpay payment completes successfully.</p>
        <div className="rounded-[28px] bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{booking.routeSummary}</p>
          <p className="mt-2">Amount due: {formatCurrency(payment.amount)}</p>
          <p className="mt-1">Order ID: {payment.providerOrderId}</p>
        </div>
      </Card>
      <Card className="space-y-5">
        <h2 className="font-display text-3xl font-semibold text-slate-950">Checkout</h2>
        <p className="text-slate-600">Razorpay Standard Checkout opens in a secure modal. In local demo mode, this falls back to a mock completion path if keys are not configured.</p>
        <div className="rounded-[28px] bg-slate-50 p-5 text-sm text-slate-600">
          Passenger: {user.name}
          <br />
          Booking: {booking.routeSummary}
          <br />
          Amount: {formatCurrency(payment.amount)}
        </div>
        {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
        <Button variant="accent" onClick={openCheckout}>Open Razorpay Checkout</Button>
      </Card>
    </div>
  )
}
