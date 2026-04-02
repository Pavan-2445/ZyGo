import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel flex flex-col justify-between p-8 md:p-10"
        >
          <div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-orange-700">Ride-sharing, upgraded</span>
            <h1 className="mt-6 max-w-xl font-display text-5xl font-bold leading-tight text-slate-950">Build, browse, and book intercity carpools with startup-grade polish.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">ZyGo turns a functional MVP into a production-style experience with route intelligence, polished flows, and payment readiness.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 p-5 text-white"><div className="text-sm uppercase tracking-[0.2em] text-white/60">Maps</div><div className="mt-2 font-display text-xl">Live route previews</div></div>
            <div className="rounded-3xl bg-cyan-500 p-5 text-white"><div className="text-sm uppercase tracking-[0.2em] text-white/70">Payments</div><div className="mt-2 font-display text-xl">Razorpay-ready checkout</div></div>
            <div className="rounded-3xl bg-orange-500 p-5 text-white"><div className="text-sm uppercase tracking-[0.2em] text-white/70">Booking flow</div><div className="mt-2 font-display text-xl">Approve, pay, travel</div></div>
          </div>
        </motion.section>
        <Outlet />
      </div>
    </div>
  )
}
