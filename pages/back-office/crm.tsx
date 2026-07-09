import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { FormEvent, useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type CrmClientBundle = {
  client: {
    id: number
    contract_id: string | null
    name: string
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    status: string
    tags: string[]
  }
  projects: Array<{ id: number; title: string; status: string; contract_id: string }>
  notes: Array<{ id: number; body: string }>
  files: Array<{ id: number; file_name: string; file_url: string }>
  emails: Array<{ id: number; direction: string; subject: string; is_read: boolean }>
  contracts: Array<{ contract_id: string; payment_status: string; amount_due_cents: number; currency: string }>
}

export default function CrmPage() {
  const [clients, setClients] = useState<CrmClientBundle[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientContactEmail, setNewClientContactEmail] = useState('')

  async function loadClients() {
    const res = await fetch('/api/back-office/crm')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load clients')
      return
    }
    setClients(data.clients || [])
    setError('')
  }

  useEffect(() => {
    void loadClients()
  }, [])

  async function postAction(body: Record<string, unknown>) {
    const res = await fetch('/api/back-office/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Action failed')
      return false
    }
    setMessage(data.message || 'Saved.')
    setError('')
    await loadClients()
    return true
  }

  async function createClient(event: FormEvent) {
    event.preventDefault()
    if (!newClientName) return
    const ok = await postAction({ action: 'createClient', name: newClientName, contactEmail: newClientContactEmail })
    if (ok) {
      setNewClientName('')
      setNewClientContactEmail('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 14</p>
          <h1 className="mt-2 text-3xl font-semibold">Client Management (CRM)</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
          </div>
        </header>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Client</h2>
          <form className="mt-3 flex flex-wrap gap-2" onSubmit={createClient}>
            <input
              value={newClientName}
              onChange={(event) => setNewClientName(event.target.value)}
              placeholder="Client name"
              className="rounded border px-3 py-2"
            />
            <input
              value={newClientContactEmail}
              onChange={(event) => setNewClientContactEmail(event.target.value)}
              placeholder="Contact email"
              className="rounded border px-3 py-2"
            />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Create</button>
          </form>
        </section>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p> : null}

        <section className="grid gap-4">
          {clients.map((bundle) => (
            <article key={bundle.client.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{bundle.client.name}</h3>
                  <p className="text-sm text-slate-600">{bundle.client.contact_email || 'No email'}</p>
                  <p className="mt-1 text-xs text-slate-500">Status: {bundle.client.status}</p>
                </div>
                <div className="text-xs text-slate-500">Tags: {(bundle.client.tags || []).join(', ') || 'none'}</div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Projects</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.projects.length === 0 ? <li>None</li> : null}
                    {bundle.projects.map((project) => (
                      <li key={project.id}>{project.title} ({project.status})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Contracts</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.contracts.length === 0 ? <li>None</li> : null}
                    {bundle.contracts.map((contract) => (
                      <li key={contract.contract_id}>{contract.contract_id} ({contract.payment_status})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Emails</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.emails.length === 0 ? <li>None</li> : null}
                    {bundle.emails.slice(0, 5).map((email) => (
                      <li key={email.id}>{email.direction}: {email.subject}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => postAction({ action: 'addNote', crmClientId: bundle.client.id, noteBody: 'Followed up on roadmap priorities.' })}
                >
                  Quick Note
                </button>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => postAction({ action: 'addFile', crmClientId: bundle.client.id, fileName: 'Client Brief', fileUrl: 'https://example.com/client-brief' })}
                >
                  Quick File
                </button>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => postAction({ action: 'addEmail', crmClientId: bundle.client.id, direction: 'outbound', subject: 'Weekly Update', body: 'Shared latest progress and blockers.', isRead: true })}
                >
                  Log Email
                </button>
              </div>
            </article>
          ))}
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
        destination: '/login?callbackUrl=/back-office/crm',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
