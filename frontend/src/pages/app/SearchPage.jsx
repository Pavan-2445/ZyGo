import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/SkeletonCard'
import RideCard from '../../components/ride/RideCard'

export default function SearchPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ source: 'Hyderabad', destination: 'Guntur' })
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadResults() {
    setLoading(true)
    setMessage('')
    try {
      const data = await api.searchRides(filters.source, filters.destination)
      setRides(data)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
  }, [])

  async function handleRequest(rideId) {
    try {
      await api.requestBooking({ rideId, passengerId: user.id })
      setMessage('Booking request sent to the driver. They will see it on their Incoming Requests panel after refresh or within a few seconds.')
      await loadResults()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <Input label="Source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} />
          <Input label="Destination" value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })} />
          <Button variant="accent" onClick={loadResults}>Search rides</Button>
        </div>
      </Card>

      {message && <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{message}</p>}

      <div className="space-y-4">
        {loading && <><SkeletonCard /><SkeletonCard /></>}
        {!loading && rides.length === 0 && <EmptyState title="No rides matched this route" description="Try a nearby stop or a broader destination pair to see more offers." />}
        {!loading && rides.map((ride) => <RideCard key={ride.id} ride={ride} onRequest={handleRequest} />)}
      </div>
    </div>
  )
}
