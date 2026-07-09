import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function ClientGoogleWorkspacePage() {
  const { data: session, status } = useSession()
  const [resources, setResources] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadResources() {
    const res = await fetch('/api/client/google-workspace')
    const data = await res.json().catch(() => ({} as { resources?: any[]; message?: string }))
    if (!res.ok) {
      setError(data.message || 'Failed to load resources')
      return
    }
    setResources(data.resources || [])
    setError('')
  }

  async function provisionResources() {
    const res = await fetch('/api/client/google-workspace', { method: 'POST' })
    const data = await res.json().catch(() => ({} as { resources?: any[]; message?: string }))
    if (!res.ok) {
      setError(data.message || 'Failed to provision resources')
      return
    }
    setResources(data.resources || [])
    setMessage(data.message || 'Resources created')
    setError('')
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadResources()
    }
  }, [status])

  if (status === 'loading') return <p className="p-8">Loading...</p>
  if (!session) return <p className="p-8">Please sign in.</p>

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Google Workspace</h1>
      <p className="mt-2 text-slate-600">Auto-provisioned client folder structure and shared docs.</p>
      <div className="mt-4 flex gap-3">
        <a href="/client-portal" className="rounded-lg bg-slate-200 px-3 py-2">Back to Dashboard</a>
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-white" onClick={provisionResources}>Create / Refresh Resources</button>
      </div>
      {message ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <a key={resource.id} href={resource.resource_url} target="_blank" rel="noreferrer" className="rounded-xl border bg-white p-4 shadow-sm hover:bg-slate-50">
            <p className="font-semibold text-slate-900">{resource.resource_name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{resource.resource_type}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Client Collaboration</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Upload project documents through the project workspace files area.</li>
          <li>Edit shared documents using the provided Google Docs links.</li>
          <li>Leave comments and feedback in the project workspace feedback section.</li>
        </ul>
      </div>
    </main>
  )
}