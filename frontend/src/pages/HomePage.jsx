import StatCard from '../components/StatCard'

export default function HomePage() {
  return (
    <div className="page-grid">
      <section className="panel spotlight">
        <p className="eyebrow">Ride-sharing MVP</p>
        <h1>Offer intercity rides, match by route order, approve requests, and collect payment.</h1>
        <p>
          Drivers publish scheduled trips with stops and seats. Passengers search by source and destination,
          request a seat, and pay only after the driver accepts.
        </p>
      </section>
      <section className="stats-grid">
        <StatCard label="Authentication" value="Email / Phone + 12-digit ID" hint="Mock identity lookup enriches the profile." />
        <StatCard label="Ride Matching" value="Ordered route matching" hint="Source must appear before destination." />
        <StatCard label="Payments" value="Stripe-ready" hint="Falls back to mock mode without a secret key." />
      </section>
    </div>
  )
}
