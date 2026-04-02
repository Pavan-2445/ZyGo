import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

const steps = ['Identity', 'Profile', 'Contact', 'Confirm']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [identity, setIdentity] = useState(null)
  const [form, setForm] = useState({
    aadhaarMockId: '',
    email: '',
    phone: '',
    address: '',
  })

  const canContinue = useMemo(() => {
    if (step === 0) return form.aadhaarMockId.length === 12
    if (step === 2) return form.phone.trim() && form.address.trim()
    return true
  }, [form, step])

  async function fetchIdentity() {
    setLoading(true)
    setMessage('')
    try {
      const profile = await api.previewIdentity(form.aadhaarMockId)
      setIdentity(profile)
      setStep(1)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitRegistration() {
    setLoading(true)
    setMessage('')
    try {
      const user = await api.register(form)
      setUser(user)
      navigate('/home')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="self-center overflow-hidden p-8 md:p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        {steps.map((item, index) => (
          <div key={item} className="flex-1">
            <div className={`mb-2 h-1 rounded-full ${index <= step ? 'bg-slate-950' : 'bg-slate-200'}`} />
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${index <= step ? 'text-slate-950' : 'text-slate-400'}`}>{item}</p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="space-y-6"
        >
          {step === 0 && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Step 1</p>
                <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Verify your identity</h2>
                <p className="mt-3 text-slate-600">Enter a 12-digit ID to fetch name, age, DOB, and city from the mock identity service.</p>
              </div>
              <Input label="12-digit unique ID" placeholder="111122223333" value={form.aadhaarMockId} onChange={(e) => setForm({ ...form, aadhaarMockId: e.target.value })} />
              <Button variant="accent" onClick={fetchIdentity} disabled={!canContinue || loading}>{loading ? 'Fetching...' : 'Fetch profile'}</Button>
            </>
          )}

          {step === 1 && identity && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Step 2</p>
                <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Review your profile</h2>
                <p className="mt-3 text-slate-600">These details are returned by the backend identity lookup before registration.</p>
              </div>
              <div className="grid gap-4 rounded-[28px] bg-slate-50 p-5 md:grid-cols-2">
                <ProfileRow label="Full name" value={identity.name} />
                <ProfileRow label="Age" value={identity.age} />
                <ProfileRow label="DOB" value={identity.dob} />
                <ProfileRow label="Location" value={identity.location} />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button variant="accent" onClick={() => setStep(2)}>Continue</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Step 3</p>
                <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Add contact details</h2>
                <p className="mt-3 text-slate-600">Phone and address complete your ride-sharing profile.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Phone" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <Input label="Address" placeholder="Road no. 12, Banjara Hills, Hyderabad" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button variant="accent" onClick={() => setStep(3)} disabled={!canContinue}>Continue</Button>
              </div>
            </>
          )}

          {step === 3 && identity && (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Step 4</p>
                <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Confirm and register</h2>
                <p className="mt-3 text-slate-600">Double-check the information below before creating your account.</p>
              </div>
              <div className="space-y-4 rounded-[28px] bg-slate-50 p-5 text-sm text-slate-700">
                <ProfileRow label="Name" value={identity.name} />
                <ProfileRow label="Location" value={identity.location} />
                <ProfileRow label="Email" value={form.email || 'Not provided'} />
                <ProfileRow label="Phone" value={form.phone} />
                <ProfileRow label="Address" value={form.address} />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button variant="accent" onClick={submitRegistration} disabled={loading}>{loading ? 'Registering...' : 'Create account'}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {message && <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
    </Card>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}
