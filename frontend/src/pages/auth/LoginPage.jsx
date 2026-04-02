import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', phone: '', aadhaarMockId: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const user = await api.login(form)
      setUser(user)
      navigate(location.state?.from || '/home')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="self-center p-8 md:p-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Sign in</p>
        <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Welcome back</h2>
        <p className="mt-3 text-slate-600">Use a seeded 12-digit ID plus your email or phone to continue.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input label="Email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="12-digit unique ID" placeholder="111122223333" value={form.aadhaarMockId} onChange={(e) => setForm({ ...form, aadhaarMockId: e.target.value })} required />
        <Button variant="accent" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</Button>
      </form>
      {message && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
      <p className="mt-6 text-sm text-slate-600">New here? <Link to="/register" className="font-semibold text-slate-950">Create an account</Link></p>
    </Card>
  )
}
