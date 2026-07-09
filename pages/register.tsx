import { FormEvent, useState } from 'react'
import Header from '../components/Header'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

type Role = 'admin' | 'client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [contractId, setContractId] = useState('')
  const [adminRegistrationCode, setAdminRegistrationCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          contractId: role === 'client' ? contractId : undefined,
          adminRegistrationCode: role === 'admin' ? adminRegistrationCode : undefined,
        }),
      })

      const data = (await response.json().catch(() => ({ message: 'Registration failed.' }))) as {
        message?: string
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setMessage(data.message || 'Account created. Please verify your email before logging in.')
      setName('')
      setEmail('')
      setPassword('')
      setContractId('')
      setAdminRegistrationCode('')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Register" description="Create your account and role." align="left" />
        <SurfaceCard className="mt-8 max-w-xl">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <input type="text" required placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-brand-cloud px-4 py-3" />
            <input type="email" required placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-brand-cloud px-4 py-3" />
            <input type="password" required placeholder="Password (min 8 chars)" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-brand-cloud px-4 py-3" />

            <label className="text-sm text-brand-slate">Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="w-full rounded-xl border border-brand-cloud px-4 py-3">
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>

            {role === 'client' ? (
              <input type="text" placeholder="Contract ID (optional)" value={contractId} onChange={(event) => setContractId(event.target.value)} className="w-full rounded-xl border border-brand-cloud px-4 py-3" />
            ) : (
              <input type="password" required placeholder="Admin registration code" value={adminRegistrationCode} onChange={(event) => setAdminRegistrationCode(event.target.value)} className="w-full rounded-xl border border-brand-cloud px-4 py-3" />
            )}

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {message ? <p className="text-sm text-brand-slate">{message}</p> : null}
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Register'}</Button>
          </form>
          <p className="mt-4 text-sm text-brand-slate">
            Already verified?{' '}
            <a href="/login" className="text-brand-ember">Go to login</a>
          </p>
        </SurfaceCard>
      </main>
    </div>
  )
}