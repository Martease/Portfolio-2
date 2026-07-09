import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

export default function VerifyEmailPage() {
  const router = useRouter()
  const token = useMemo(() => (typeof router.query.token === 'string' ? router.query.token : ''), [router.query.token])

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    let active = true
    async function verify() {
      setStatus('verifying')
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = (await response.json().catch(() => ({ message: 'Verification failed.' }))) as { message?: string }
      if (!active) return

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed.')
      }
    }

    void verify()
    return () => {
      active = false
    }
  }, [token])

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Verify Email" description="Confirm your account email to enable login." align="left" />
        <SurfaceCard className="mt-8 max-w-xl">
          {status === 'idle' && <p className="text-sm text-brand-slate">Waiting for verification token...</p>}
          {status === 'verifying' && <p className="text-sm text-brand-slate">Verifying your email...</p>}
          {status === 'success' && (
            <p className="text-sm text-green-700">
              {message} <a href="/login" className="text-brand-ember">Continue to login</a>
            </p>
          )}
          {status === 'error' && <p className="text-sm text-red-700">{message}</p>}
        </SurfaceCard>
      </main>
    </div>
  )
}