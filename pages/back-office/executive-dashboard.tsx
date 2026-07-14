import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type DashboardPayload = {
  revenueCents: number
  projects: number
  clients: number
  tasks: number
  deadlines: number
  unreadMessages: number
  pendingContracts: number
  invoices: number
  upcomingDeadlines: Array<{ type: string; title: string; due_date: string }>
  latestUnreadMessages: Array<{ id: number; subject: string; sent_at: string; client_name: string }>
}

const currency = (amountCents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountCents / 100)

export default function ExecutiveDashboardPage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null)
  const [error, setError] = useState('')

  async function loadData() {
    setError('')
    const res = await fetch('/api/back-office/executive-dashboard')
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(data.message || 'Failed to load executive dashboard.')
      return
    }

    setPayload(data)
  }

  useEffect(() => {
    void loadData()
  }, [])

  const cards = [
    { label: 'Revenue', value: currency(payload?.revenueCents || 0) },
    { label: 'Projects', value: String(payload?.projects || 0) },
    { label: 'Clients', value: String(payload?.clients || 0) },
    { label: 'Tasks', value: String(payload?.tasks || 0) },
    { label: 'Deadlines', value: String(payload?.deadlines || 0) },
    { label: 'Unread Messages', value: String(payload?.unreadMessages || 0) },
    { label: 'Pending Contracts', value: String(payload?.pendingContracts || 0) },
    { label: 'Invoices', value: String(payload?.invoices || 0) },
  ]

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 13</p>
          <h1 className="mt-2 text-3xl font-semibold">Executive Dashboard</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/crm" className="rounded bg-white/10 px-3 py-2">CRM</a>
            <a href="/back-office/projects" className="rounded bg-white/10 px-3 py-2">Projects</a>
            <a href="/back-office/wiki" className="rounded bg-white/10 px-3 py-2">Knowledge Base</a>
            <a href="/back-office/analytics" className="rounded bg-white/10 px-3 py-2">Analytics</a>
            <a href="/back-office/infrastructure" className="rounded bg-white/10 px-3 py-2">Infrastructure</a>
            <a href="/back-office/audit-logs" className="rounded bg-white/10 px-3 py-2">Audit Logs</a>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(payload?.upcomingDeadlines || []).length === 0 ? <li>No upcoming deadlines.</li> : null}
              {(payload?.upcomingDeadlines || []).map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded bg-slate-50 px-3 py-2">
                  {item.title} ({item.type}) - {new Date(item.due_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Unread Messages</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {(payload?.latestUnreadMessages || []).length === 0 ? <li>No unread messages.</li> : null}
              {(payload?.latestUnreadMessages || []).map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">
                  <p className="font-medium">{item.subject}</p>
                  <p className="text-xs text-slate-500">{item.client_name}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Operations Snapshot</h2>
          <div className="mt-4 space-y-3">
            {cards.map((card) => {
              const numericValue = Number(card.value.replace(/[^0-9.]/g, '')) || 0
              const maxBase = payload ? Math.max(payload.projects, payload.clients, payload.tasks, payload.deadlines, payload.unreadMessages, payload.pendingContracts, payload.invoices, 1) : 1
              const width = card.label === 'Revenue'
                ? Math.min(100, ((payload?.revenueCents || 0) / 1_000_000) * 100)
                : Math.min(100, (numericValue / maxBase) * 100)

              return (
                <div key={`${card.label}-bar`}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                    <span>{card.label}</span>
                    <span className="font-semibold">{card.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-800" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
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
        destination: '/login?callbackUrl=/back-office/executive-dashboard',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
