import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { FormEvent, useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type AuditLog = {
  id: number
  actor_email: string
  actor_role: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata_json: Record<string, unknown>
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [actorEmail, setActorEmail] = useState('')
  const [error, setError] = useState('')

  async function loadLogs(filters?: { action?: string; entityType?: string; actorEmail?: string }) {
    setError('')
    const query = new URLSearchParams()

    if (filters?.action) query.set('action', filters.action)
    if (filters?.entityType) query.set('entityType', filters.entityType)
    if (filters?.actorEmail) query.set('actorEmail', filters.actorEmail)
    query.set('limit', '150')

    const res = await fetch(`/api/back-office/audit-logs?${query.toString()}`)
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(data.message || 'Failed to load audit logs.')
      return
    }

    setLogs(data.logs || [])
  }

  useEffect(() => {
    void loadLogs()
  }, [])

  async function onFilter(event: FormEvent) {
    event.preventDefault()
    await loadLogs({ action, entityType, actorEmail })
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Security</p>
          <h1 className="mt-2 text-3xl font-semibold">Audit Logs</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
          </div>
        </header>

        <section className="rounded-xl border bg-white p-4">
          <form className="grid gap-2 sm:grid-cols-4" onSubmit={onFilter}>
            <input value={action} onChange={(event) => setAction(event.target.value)} placeholder="Filter action" className="rounded border px-3 py-2" />
            <input value={entityType} onChange={(event) => setEntityType(event.target.value)} placeholder="Filter entity type" className="rounded border px-3 py-2" />
            <input value={actorEmail} onChange={(event) => setActorEmail(event.target.value)} placeholder="Filter actor email" className="rounded border px-3 py-2" />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Apply</button>
          </form>
        </section>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

        <section className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>No logs found.</td>
                </tr>
              ) : null}
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-3 py-2 text-slate-700">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-slate-700">{log.actor_email}</td>
                  <td className="px-3 py-2 text-slate-900">{log.action}</td>
                  <td className="px-3 py-2 text-slate-700">{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    <pre className="max-w-[420px] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.metadata_json || {}, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        destination: '/login?callbackUrl=/back-office/audit-logs',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
