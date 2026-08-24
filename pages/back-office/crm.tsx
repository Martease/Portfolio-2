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
  const [newClientContactName, setNewClientContactName] = useState('')
  const [newClientContactEmail, setNewClientContactEmail] = useState('')
  const [newClientContactPhone, setNewClientContactPhone] = useState('')
  const [newClientStatus, setNewClientStatus] = useState('Active')
  const [newClientTags, setNewClientTags] = useState('')
  const [inviteClientId, setInviteClientId] = useState<number | ''>('')
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

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
    const ok = await postAction({
      action: 'createClient',
      name: newClientName,
      contactName: newClientContactName || undefined,
      contactEmail: newClientContactEmail || undefined,
      contactPhone: newClientContactPhone || undefined,
      status: newClientStatus || undefined,
      tags: newClientTags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    })
    if (ok) {
      setNewClientName('')
      setNewClientContactName('')
      setNewClientContactEmail('')
      setNewClientContactPhone('')
      setNewClientStatus('Active')
      setNewClientTags('')
    }
  }

  async function addNoteForClient(crmClientId: number) {
    const noteBody = window.prompt('Note')
    if (!noteBody?.trim()) return
    await postAction({ action: 'addNote', crmClientId, noteBody })
  }

  async function addFileForClient(crmClientId: number) {
    const fileName = window.prompt('File name')
    if (!fileName?.trim()) return
    const fileUrl = window.prompt('File URL (https://...)')
    if (!fileUrl?.trim()) return
    await postAction({ action: 'addFile', crmClientId, fileName, fileUrl })
  }

  async function addEmailForClient(crmClientId: number) {
    const directionInput = window.prompt('Direction: inbound or outbound', 'outbound')
    const direction = directionInput === 'inbound' ? 'inbound' : 'outbound'
    const subject = window.prompt('Email subject')
    if (!subject?.trim()) return
    const body = window.prompt('Email body')
    if (!body?.trim()) return
    const isRead = direction === 'outbound'
    await postAction({ action: 'addEmail', crmClientId, direction, subject, body, isRead })
  }

  async function editClient(bundle: CrmClientBundle) {
    const contactName = window.prompt('Contact name', bundle.client.contact_name || '') || undefined
    const contactEmail = window.prompt('Contact email', bundle.client.contact_email || '') || undefined
    const contactPhone = window.prompt('Contact phone', bundle.client.contact_phone || '') || undefined
    const status = window.prompt('Status', bundle.client.status) || undefined
    const tags = window.prompt('Tags (comma separated)', (bundle.client.tags || []).join(', '))
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    await postAction({
      action: 'updateClient',
      crmClientId: bundle.client.id,
      contactName,
      contactEmail,
      contactPhone,
      status,
      tags,
    })
  }

  async function sendPortalInvite(event: FormEvent) {
    event.preventDefault()

    if (!inviteClientId || !inviteEmail || !inviteName) {
      setError('Client, invite name, and invite email are required.')
      return
    }

    const selected = clients.find((bundle) => bundle.client.id === Number(inviteClientId))
    if (!selected) {
      setError('Selected client not found.')
      return
    }

    const contractId = selected.client.contract_id || selected.contracts[0]?.contract_id
    if (!contractId) {
      setError('Selected client has no linked contract. Create/link a contract first.')
      return
    }

    const response = await fetch('/api/portal/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: inviteName,
        email: inviteEmail,
        contractId,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.message || 'Failed to send portal invitation.')
      return
    }

    setMessage(`Portal invitation created for ${inviteEmail}.`)
    setError('')
    setInviteEmail('')
    setInviteName('')
    setInviteClientId('')
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
            <a href="/back-office/infrastructure" className="rounded bg-white/10 px-3 py-2">Infrastructure</a>
            <a href="/api/back-office/export/crm" className="rounded bg-white/10 px-3 py-2">Export CSV</a>
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
              value={newClientContactName}
              onChange={(event) => setNewClientContactName(event.target.value)}
              placeholder="Contact name"
              className="rounded border px-3 py-2"
            />
            <input
              value={newClientContactEmail}
              onChange={(event) => setNewClientContactEmail(event.target.value)}
              placeholder="Contact email"
              className="rounded border px-3 py-2"
            />
            <input
              value={newClientContactPhone}
              onChange={(event) => setNewClientContactPhone(event.target.value)}
              placeholder="Contact phone"
              className="rounded border px-3 py-2"
            />
            <input
              value={newClientStatus}
              onChange={(event) => setNewClientStatus(event.target.value)}
              placeholder="Status"
              className="rounded border px-3 py-2"
            />
            <input
              value={newClientTags}
              onChange={(event) => setNewClientTags(event.target.value)}
              placeholder="Tags (comma separated)"
              className="rounded border px-3 py-2"
            />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Create</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Invite Client To Portal</h2>
          <p className="mt-1 text-sm text-slate-600">Sends an activation link and password setup flow for the selected client contact.</p>
          <form className="mt-3 flex flex-wrap gap-2" onSubmit={sendPortalInvite}>
            <select
              value={inviteClientId}
              onChange={(event) => {
                const value = event.target.value
                if (!value) {
                  setInviteClientId('')
                  return
                }

                const clientId = Number(value)
                setInviteClientId(clientId)

                const selected = clients.find((bundle) => bundle.client.id === clientId)
                if (selected?.client.contact_name) {
                  setInviteName(selected.client.contact_name)
                }
                if (selected?.client.contact_email) {
                  setInviteEmail(selected.client.contact_email)
                }
              }}
              className="rounded border px-3 py-2"
            >
              <option value="">Select client</option>
              {clients.map((bundle) => (
                <option key={bundle.client.id} value={bundle.client.id}>
                  {bundle.client.name}
                </option>
              ))}
            </select>
            <input
              value={inviteName}
              onChange={(event) => setInviteName(event.target.value)}
              placeholder="Invitee name"
              className="rounded border px-3 py-2"
            />
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Invitee email"
              className="rounded border px-3 py-2"
            />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Send Invite</button>
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
                  <p className="text-sm font-semibold text-slate-800">Contact Info</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    <li>Name: {bundle.client.contact_name || 'N/A'}</li>
                    <li>Email: {bundle.client.contact_email || 'N/A'}</li>
                    <li>Phone: {bundle.client.contact_phone || 'N/A'}</li>
                    <li>Status: {bundle.client.status}</li>
                    <li>Tags: {(bundle.client.tags || []).join(', ') || 'none'}</li>
                  </ul>
                </div>
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
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Notes</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.notes.length === 0 ? <li>None</li> : null}
                    {bundle.notes.slice(0, 6).map((note) => (
                      <li key={note.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{note.body}</span>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteNote', crmClientId: bundle.client.id, noteId: note.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Files</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.files.length === 0 ? <li>None</li> : null}
                    {bundle.files.slice(0, 6).map((file) => (
                      <li key={file.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <a href={file.file_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            {file.file_name}
                          </a>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteFile', crmClientId: bundle.client.id, fileId: file.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Emails</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {bundle.emails.length === 0 ? <li>None</li> : null}
                    {bundle.emails.slice(0, 5).map((email) => (
                      <li key={email.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{email.direction}: {email.subject}</span>
                          <div className="flex gap-1">
                            <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'markEmailRead', crmClientId: bundle.client.id, emailId: email.id, isRead: !email.is_read })}>{email.is_read ? 'Unread' : 'Read'}</button>
                            <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteEmail', crmClientId: bundle.client.id, emailId: email.id })}>Delete</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded border px-2 py-1 text-xs" onClick={() => editClient(bundle)}>Edit Client</button>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => addNoteForClient(bundle.client.id)}
                >
                  Add Note
                </button>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => addFileForClient(bundle.client.id)}
                >
                  Add File
                </button>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => addEmailForClient(bundle.client.id)}
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
