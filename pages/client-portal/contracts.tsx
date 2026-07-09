import { useSession } from 'next-auth/react'
import { FormEvent, useEffect, useState } from 'react'

export default function ClientContractsPage() {
  const { data: session, status } = useSession()
  const [payload, setPayload] = useState<any>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [templateName, setTemplateName] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [contractSnapshot, setContractSnapshot] = useState('')
  const [signedDocId, setSignedDocId] = useState('')
  const [signedUrl, setSignedUrl] = useState('')

  async function loadContracts() {
    const res = await fetch('/api/client/contracts')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load contracts')
      return
    }
    setPayload(data)
    setError('')
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadContracts()
    }
  }, [status])

  async function postAction(body: Record<string, unknown>) {
    const res = await fetch('/api/client/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Action failed')
      return
    }
    setMessage(data.message || 'Success')
    setError('')
    await loadContracts()
  }

  async function createTemplate(event: FormEvent) {
    event.preventDefault()
    await postAction({ action: 'createTemplate', name: templateName, templateBody })
    setTemplateName('')
    setTemplateBody('')
  }

  async function generateContract(event: FormEvent) {
    event.preventDefault()
    await postAction({ action: 'generate', title: contractTitle, contentSnapshot: contractSnapshot })
    setContractTitle('')
    setContractSnapshot('')
  }

  async function uploadSignedCopy(event: FormEvent) {
    event.preventDefault()
    await postAction({ action: 'uploadSignedCopy', documentId: Number(signedDocId), signedCopyUrl: signedUrl })
    setSignedDocId('')
    setSignedUrl('')
  }

  if (status === 'loading') return <p className="p-8">Loading...</p>
  if (!session) return <p className="p-8">Please sign in.</p>

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Contracts Module</h1>
      <p className="mt-2 text-slate-600">Templates, PDF generation, version history, signed copy upload, and client downloads.</p>
      <div className="mt-4 flex gap-3">
        <a href="/client-portal" className="rounded-lg bg-slate-200 px-3 py-2">Back to Dashboard</a>
      </div>

      {message ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {session.user?.role === 'admin' ? (
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Create Template</h2>
            <form className="mt-2 grid gap-2" onSubmit={createTemplate}>
              <input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Template name" className="rounded border px-3 py-2" />
              <textarea value={templateBody} onChange={(event) => setTemplateBody(event.target.value)} placeholder="Template body" className="rounded border px-3 py-2" rows={4} />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Save Template</button>
            </form>
          </section>
        ) : null}

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-slate-900">Generate PDF Contract</h2>
          <form className="mt-2 grid gap-2" onSubmit={generateContract}>
            <input value={contractTitle} onChange={(event) => setContractTitle(event.target.value)} placeholder="Document title" className="rounded border px-3 py-2" />
            <textarea value={contractSnapshot} onChange={(event) => setContractSnapshot(event.target.value)} placeholder="Contract content snapshot" className="rounded border px-3 py-2" rows={4} />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Generate</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Upload Signed Copy</h2>
          <form className="mt-2 grid gap-2 sm:grid-cols-[220px_1fr_auto]" onSubmit={uploadSignedCopy}>
            <input value={signedDocId} onChange={(event) => setSignedDocId(event.target.value)} placeholder="Document ID" className="rounded border px-3 py-2" />
            <input value={signedUrl} onChange={(event) => setSignedUrl(event.target.value)} placeholder="Signed copy URL" className="rounded border px-3 py-2" />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Upload</button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-slate-900">Templates</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {(payload?.templates || []).map((item: any) => (
              <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.name}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold text-slate-900">Version History</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {(payload?.versions || []).map((item: any) => (
              <li key={item.id} className="rounded bg-slate-50 px-3 py-2">
                v{item.version_number} - {item.change_note || 'Update'}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Contract Documents</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {(payload?.documents || []).map((item: any) => (
              <li key={item.id} className="rounded bg-slate-50 px-3 py-2">
                <p className="font-medium">#{item.id} {item.title}</p>
                <div className="mt-1 flex flex-wrap gap-3">
                  {item.pdf_url ? <a href={item.pdf_url} className="text-blue-700 underline">Client download (PDF)</a> : null}
                  {item.signed_copy_url ? <a href={item.signed_copy_url} className="text-blue-700 underline">Signed copy</a> : <span>No signed copy uploaded</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}