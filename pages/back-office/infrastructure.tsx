import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type InfrastructureStatus = {
  frontend: { nextjs: boolean; typescript: boolean; tailwindcss: boolean }
  backend: { apiRoutes: boolean; prismaOrm: boolean }
  database: { postgresql: boolean }
  authentication: { provider: string }
  storage: { googleDriveApiConfigured: boolean; googleDocsApiConfigured: boolean }
  deployment: { vercelReady: boolean }
}

const StatusPill = ({ ok }: { ok: boolean }) => (
  <span className={[
    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
    ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
  ].join(' ')}>
    {ok ? 'Configured' : 'Missing'}
  </span>
)

export default function InfrastructurePage() {
  const [status, setStatus] = useState<InfrastructureStatus | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    const res = await fetch('/api/back-office/infrastructure')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load infrastructure status')
      return
    }
    setStatus(data)
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Phase 5 · Epic 18</p>
          <h1 className="mt-2 text-3xl font-semibold">Infrastructure Status</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

        {status ? (
          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">Frontend</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span>Next.js</span><StatusPill ok={status.frontend.nextjs} /></li>
                <li className="flex items-center justify-between"><span>TypeScript</span><StatusPill ok={status.frontend.typescript} /></li>
                <li className="flex items-center justify-between"><span>Tailwind CSS</span><StatusPill ok={status.frontend.tailwindcss} /></li>
              </ul>
            </article>

            <article className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">Backend + Data</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span>API Routes</span><StatusPill ok={status.backend.apiRoutes} /></li>
                <li className="flex items-center justify-between"><span>Prisma ORM</span><StatusPill ok={status.backend.prismaOrm} /></li>
                <li className="flex items-center justify-between"><span>PostgreSQL</span><StatusPill ok={status.database.postgresql} /></li>
              </ul>
            </article>

            <article className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">Auth + Storage</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span>Auth Provider ({status.authentication.provider})</span><StatusPill ok /></li>
                <li className="flex items-center justify-between"><span>Google Drive API</span><StatusPill ok={status.storage.googleDriveApiConfigured} /></li>
                <li className="flex items-center justify-between"><span>Google Docs API</span><StatusPill ok={status.storage.googleDocsApiConfigured} /></li>
              </ul>
            </article>

            <article className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">Deployment</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span>Vercel Ready</span><StatusPill ok={status.deployment.vercelReady} /></li>
              </ul>
            </article>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/login?callbackUrl=/back-office/infrastructure',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
