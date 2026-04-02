import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const initialState = { email: '', phone: '', aadhaarMockId: '' }

export default function AuthPage() {
  const { setUser } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialState)
  const [message, setMessage] = useState('Use one of the seeded mock IDs like 111122223333 or 222233334444.')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const action = mode === 'login' ? api.login : api.register
      const user = await action(form)
      setUser(user)
      setMessage(`${mode === 'login' ? 'Logged in' : 'Registered'} as ${user.name}.`)
      setForm(initialState)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel form-panel narrow">
      <div className="split-toggle">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your rider profile'}</h2>
      <form className="stack-form" onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="12-digit unique ID" value={form.aadhaarMockId} onChange={(e) => setForm({ ...form, aadhaarMockId: e.target.value })} required />
        <button className="primary-button" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </section>
  )
}
