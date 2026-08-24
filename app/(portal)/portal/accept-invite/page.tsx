'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!token) {
      setError('Invitation token is missing. Use the full invitation link from your email.')
      setSubmitting(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    const response = await fetch('/api/portal/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const body = await response.json().catch(() => ({ message: 'Unexpected server response.' }))

    if (!response.ok) {
      setError(body.message || 'Unable to accept invitation.')
      setSubmitting(false)
      return
    }

    setSuccess('Invitation accepted. Redirecting to login...')
    setTimeout(() => {
      router.push('/portal/login')
    }, 1200)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Accept Invitation</h1>
      <p className="mt-2 text-sm text-slate-600">Set your password to activate your Bycra portal account.</p>

      <form className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="password"
          required
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Activate account'}
        </button>
      </form>
    </main>
  )
}
