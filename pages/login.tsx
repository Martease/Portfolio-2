import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import Header from '../components/Header'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'admin') {
        router.replace('/back-office')
      } else {
        router.replace('/client-portal')
      }
    }
  }, [router, session, status])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const callbackUrl = typeof router.query.callbackUrl === 'string' ? router.query.callbackUrl : '/client-portal'

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

    await router.push(result.url || callbackUrl)
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Login" description="Sign in to access your portal." align="left" />
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
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-brand-cloud px-4 py-3"
            />
            <label className="inline-flex items-center gap-2 text-sm text-brand-slate">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              Remember Me
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-brand-slate">
            <a href="/register" className="text-brand-ember">Create account</a>
            <a href="/forgot-password" className="text-brand-ember">Forgot password?</a>
          </div>
        </SurfaceCard>
      </main>
    </div>
  )
}