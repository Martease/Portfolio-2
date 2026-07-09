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

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 15</p>
          <h1 className="mt-2 text-3xl font-semibold">Project Workspace</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
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
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.tasks.slice(0, 6).map((task) => (
                      <li key={task.id} className="rounded bg-slate-50 px-2 py-1">{task.title} ({task.status})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Timeline</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.timeline.slice(0, 6).map((event) => (
                      <li key={event.id} className="rounded bg-slate-50 px-2 py-1">{event.title}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Files / Assets</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.files.slice(0, 3).map((file) => (
                      <li key={file.id} className="rounded bg-slate-50 px-2 py-1">{file.file_name}</li>
                    ))}
                    {bundle.assets.slice(0, 3).map((asset) => (
                      <li key={asset.id} className="rounded bg-slate-50 px-2 py-1">{asset.asset_name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Credentials / Integrations</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {bundle.credentials.slice(0, 3).map((credential) => (
                      <li key={credential.id} className="rounded bg-slate-50 px-2 py-1">{credential.credential_name}</li>
                    ))}
                    <li className="rounded bg-slate-50 px-2 py-1">GitHub: {bundle.integrations?.github_url || 'N/A'}</li>
                    <li className="rounded bg-slate-50 px-2 py-1">Deployment: {bundle.integrations?.deployment_url || 'N/A'}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addTask', projectId: bundle.project.id, title: 'New admin task' })}>Add Task</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addTimeline', projectId: bundle.project.id, title: 'Planning update' })}>Add Timeline</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addFile', projectId: bundle.project.id, fileName: 'Spec.pdf', fileUrl: 'https://example.com/spec.pdf' })}>Add File</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addAsset', projectId: bundle.project.id, assetName: 'Logo', assetType: 'image', assetUrl: 'https://example.com/logo.png' })}>Add Asset</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addNote', projectId: bundle.project.id, noteBody: 'Credential rotation due next sprint.' })}>Add Note</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'addCredential', projectId: bundle.project.id, credentialName: 'AWS Access Key', credentialValueMasked: 'AKIA********' })}>Add Credential</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => postAction({ action: 'upsertIntegration', projectId: bundle.project.id, githubUrl: 'https://github.com/Martease/Portfolio-2', deploymentUrl: 'https://mamvo-labs.com' })}>Set Integrations</button>
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
