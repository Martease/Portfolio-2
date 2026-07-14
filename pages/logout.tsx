import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

export default function LogoutPage() {
  useEffect(() => {
    void signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <SectionHeading eyebrow="Authentication" title="Logout" description="Signing you out securely." align="left" />
        <SurfaceCard className="mt-8 max-w-xl">
          <p className="text-sm text-brand-slate">Please wait while your session is closed.</p>
        </SurfaceCard>
      </main>
    </div>
  )
}