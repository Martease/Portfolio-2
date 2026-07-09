import { FormEvent, useState } from 'react'
import Header from '../components/Header'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = (await response.json().catch(() => ({ message: 'Please try again.' }))) as { message?: string }
    setMessage(data.message || 'Please try again.')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Password Reset" description="Request a password reset link." align="left" />
        <SurfaceCard className="mt-8 max-w-xl">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-brand-cloud px-4 py-3"
            />
            <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send reset link'}</Button>
          </form>
          {message ? <p className="mt-4 text-sm text-brand-slate">{message}</p> : null}
        </SurfaceCard>
      </main>
    </div>
  )
}