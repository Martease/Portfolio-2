import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type ProjectBundle = {
  project: { id: number; title: string; status: string; contract_id: string; progress_percent: number }
  tasks: Array<{ id: number; title: string; status: string }>
  timeline: Array<{ id: number; title: string; event_date: string }>
  files: Array<{ id: number; file_name: string; file_url: string }>
  assets: Array<{ id: number; asset_name: string; asset_type: string; asset_url: string }>
  notes: Array<{ id: number; body: string }>
  credentials: Array<{ id: number; credential_name: string; credential_value_masked: string }>
  integrations: { github_url: string | null; deployment_url: string | null } | null
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectBundle[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const kanbanColumns = ['Pending', 'In Progress', 'Blocked', 'Done']

  async function loadProjects() {
    const res = await fetch('/api/back-office/projects')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load projects')
      return
    }
    setProjects(data.projects || [])
    setError('')
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  async function postAction(body: Record<string, unknown>) {
    const res = await fetch('/api/back-office/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Action failed')
      return
    }
    setMessage(data.message || 'Saved')
    setError('')
    await loadProjects()
  }

  async function addTask(projectId: number) {
    const title = window.prompt('Task title')
    if (!title?.trim()) return
    const assignee = window.prompt('Assignee (optional)') || undefined
    await postAction({ action: 'addTask', projectId, title, assignee })
  }

  async function addTimeline(projectId: number) {
    const title = window.prompt('Timeline event title')
    if (!title?.trim()) return
    const detail = window.prompt('Timeline detail (optional)') || undefined
    await postAction({ action: 'addTimeline', projectId, title, detail })
  }

  async function addFile(projectId: number) {
    const fileName = window.prompt('File name')
    if (!fileName?.trim()) return
    const fileUrl = window.prompt('File URL (https://...)')
    if (!fileUrl?.trim()) return
    await postAction({ action: 'addFile', projectId, fileName, fileUrl })
  }

  async function addAsset(projectId: number) {
    const assetName = window.prompt('Asset name')
    if (!assetName?.trim()) return
    const assetType = window.prompt('Asset type (image, video, doc, etc.)')
    if (!assetType?.trim()) return
    const assetUrl = window.prompt('Asset URL (https://...)')
    if (!assetUrl?.trim()) return
    await postAction({ action: 'addAsset', projectId, assetName, assetType, assetUrl })
  }

  async function addNote(projectId: number) {
    const noteBody = window.prompt('Note')
    if (!noteBody?.trim()) return
    await postAction({ action: 'addNote', projectId, noteBody })
  }

  async function addCredential(projectId: number) {
    const credentialName = window.prompt('Credential name')
    if (!credentialName?.trim()) return
    const credentialValueMasked = window.prompt('Masked credential value (for example, AKIA********)')
    if (!credentialValueMasked?.trim()) return
    await postAction({ action: 'addCredential', projectId, credentialName, credentialValueMasked })
  }

  async function setIntegrations(projectId: number) {
    const githubUrl = window.prompt('GitHub URL (optional)') || undefined
    const deploymentUrl = window.prompt('Deployment URL (optional)') || undefined
    if (!githubUrl && !deploymentUrl) return
    await postAction({ action: 'upsertIntegration', projectId, githubUrl, deploymentUrl })
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 15</p>
          <h1 className="mt-2 text-3xl font-semibold">Project Workspace</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
            <a href="/back-office/infrastructure" className="rounded bg-white/10 px-3 py-2">Infrastructure</a>
            <a href="/api/back-office/export/projects" className="rounded bg-white/10 px-3 py-2">Export CSV</a>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p> : null}

        <section className="grid gap-4">
          {projects.map((bundle) => (
            <article key={bundle.project.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{bundle.project.title}</h2>
                  <p className="text-sm text-slate-600">{bundle.project.contract_id} • {bundle.project.status}</p>
                </div>
                <div className="text-sm text-slate-600">Progress: {bundle.project.progress_percent}%</div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-semibold">Kanban Tasks</p>
                  <div className="mt-2 grid gap-2">
                    {kanbanColumns.map((column) => (
                      <div key={column} className="rounded bg-slate-50 p-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{column}</p>
                        <ul className="mt-1 space-y-1 text-sm">
                          {bundle.tasks
                            .filter((task) => task.status === column)
                            .slice(0, 5)
                            .map((task) => (
                              <li key={task.id} className="rounded bg-white px-2 py-1">
                                <p>{task.title}</p>
                                <select
                                  className="mt-1 w-full rounded border px-1 py-1 text-xs"
                                  value={task.status}
                                  onChange={(event) => postAction({
                                    action: 'setTaskStatus',
                                    projectId: bundle.project.id,
                                    taskId: task.id,
                                    status: event.target.value,
                                  })}
                                >
                                  {kanbanColumns.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button
                                  className="mt-1 w-full rounded border px-1 py-1 text-xs"
                                  onClick={() => postAction({ action: 'deleteTask', projectId: bundle.project.id, entityId: task.id })}
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Timeline</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.timeline.slice(0, 6).map((event) => (
                      <li key={event.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{event.title}</span>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteTimeline', projectId: bundle.project.id, entityId: event.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Files / Assets</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.files.slice(0, 3).map((file) => (
                      <li key={file.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <a href={file.file_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            {file.file_name}
                          </a>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteFile', projectId: bundle.project.id, entityId: file.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                    {bundle.assets.slice(0, 3).map((asset) => (
                      <li key={asset.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <a href={asset.asset_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            {asset.asset_name}
                          </a>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteAsset', projectId: bundle.project.id, entityId: asset.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Credentials / Integrations</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.credentials.slice(0, 3).map((credential) => (
                      <li key={credential.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{credential.credential_name}</span>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteCredential', projectId: bundle.project.id, entityId: credential.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                    <li className="rounded bg-slate-50 px-2 py-1">GitHub: {bundle.integrations?.github_url || 'N/A'}</li>
                    <li className="rounded bg-slate-50 px-2 py-1">Deployment: {bundle.integrations?.deployment_url || 'N/A'}</li>
                    <li className="rounded bg-slate-50 px-2 py-1">Notes: {bundle.notes.length}</li>
                    {bundle.notes.slice(0, 2).map((note) => (
                      <li key={note.id} className="rounded bg-slate-50 px-2 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span>{note.body}</span>
                          <button className="rounded border px-1 py-0.5 text-[11px]" onClick={() => postAction({ action: 'deleteNote', projectId: bundle.project.id, entityId: note.id })}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addTask(bundle.project.id)}>Add Task</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addTimeline(bundle.project.id)}>Add Timeline</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addFile(bundle.project.id)}>Add File</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addAsset(bundle.project.id)}>Add Asset</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addNote(bundle.project.id)}>Add Note</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => addCredential(bundle.project.id)}>Add Credential</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => setIntegrations(bundle.project.id)}>Set Integrations</button>
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
        destination: '/login?callbackUrl=/back-office/projects',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
