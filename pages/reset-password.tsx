import { useRouter } from 'next/router'
import { FormEvent, useMemo, useState } from 'react'
import Header from '../components/Header'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

export default function ResetPasswordPage() {
  const router = useRouter()
  const token = useMemo(() => (typeof router.query.token === 'string' ? router.query.token : ''), [router.query.token])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Reset token is missing.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const data = (await response.json().catch(() => ({ message: 'Please try again.' }))) as { message?: string }

    if (!response.ok) {
      setError(data.message || 'Please try again.')
      setSubmitting(false)
      return
    }

    setMessage(data.message || 'Password updated.')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Set New Password" description="Enter and confirm your new password." align="left" />
        <SurfaceCard className="mt-8 max-w-xl">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <input
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-brand-cloud px-4 py-3"
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-brand-cloud px-4 py-3"
            />
            <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update password'}</Button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-brand-slate">{message}</p> : null}
        </SurfaceCard>
      </main>
    </div>
  )
}