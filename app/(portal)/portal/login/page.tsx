'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PortalLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const callbackUrl = searchParams.get('callbackUrl') || '/portal/dashboard'

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      rememberMe: String(rememberMe),
      callbackUrl,
    })

    if (!result || result.error) {
      const message = !result?.error || result.error === 'CredentialsSignin'
        ? 'Invalid email or password.'
        : result.error
      setError(message)
      setSubmitting(false)
      return
    }

    router.push(result.url || callbackUrl)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Bycra Portal Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to manage your project workspace.</p>

      <form className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          Remember me
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 flex gap-4 text-sm text-slate-600">
        <a href="/forgot-password" className="underline">Forgot password</a>
        <a href="/portal/accept-invite" className="underline">Accept invitation</a>
      </div>
    </main>
  )
}
