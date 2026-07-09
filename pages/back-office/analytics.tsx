import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type AnalyticsPayload = {
  revenueCents: number
  projects: number
  conversionRate: number
  clientRetentionRate: number
  timeTrackingHours: number
  businessGrowthPercent: number
  monthlyRevenue: Array<{ month: string; totalCents: number }>
  recentWorklogs: Array<{ id: number; hours_spent: number; note: string | null; logged_at: string }>
}

const pct = (value: number) => `${value.toFixed(1)}%`
const money = (amountCents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountCents / 100)

export default function AnalyticsPage() {
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null)
  const [error, setError] = useState('')

  async function loadData() {
    const res = await fetch('/api/back-office/analytics')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load analytics')
      return
    }
    setPayload(data)
    setError('')
  }

  useEffect(() => {
    void loadData()
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 17</p>
          <h1 className="mt-2 text-3xl font-semibold">Analytics Dashboard</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Revenue</p><p className="text-2xl font-semibold">{money(payload?.revenueCents || 0)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Projects</p><p className="text-2xl font-semibold">{payload?.projects || 0}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Conversion Rate</p><p className="text-2xl font-semibold">{pct(payload?.conversionRate || 0)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Client Retention</p><p className="text-2xl font-semibold">{pct(payload?.clientRetentionRate || 0)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Time Tracking</p><p className="text-2xl font-semibold">{(payload?.timeTrackingHours || 0).toFixed(1)}h</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Business Growth</p><p className="text-2xl font-semibold">{pct(payload?.businessGrowthPercent || 0)}</p></article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Revenue by Month</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(payload?.monthlyRevenue || []).map((item) => (
                <li key={item.month} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
                  <span>{item.month}</span>
                  <span>{money(item.totalCents)}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Time Logs</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(payload?.recentWorklogs || []).map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">
                  <p className="font-medium">{Number(item.hours_spent).toFixed(1)}h</p>
                  <p>{item.note || 'No note'}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/login?callbackUrl=/back-office/analytics',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
