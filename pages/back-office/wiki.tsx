import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { FormEvent, useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type Entry = {
  id: number
  category: string
  title: string
  body: string
  tags: string[]
  created_by: string
  created_at: string
}

export default function WikiPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [category, setCategory] = useState('SOP')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  async function loadEntries() {
    const res = await fetch('/api/back-office/knowledge-base')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load entries')
      return
    }
    setEntries(data.entries || [])
    setError('')
  }

  useEffect(() => {
    void loadEntries()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const res = await fetch('/api/back-office/knowledge-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        title,
        body,
        tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to create entry')
      return
    }
    setTitle('')
    setBody('')
    setTags('')
    await loadEntries()
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Epic 16</p>
          <h1 className="mt-2 text-3xl font-semibold">Knowledge Base (Internal Wiki)</h1>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="/back-office" className="rounded bg-white/10 px-3 py-2">Back Office Home</a>
            <a href="/back-office/executive-dashboard" className="rounded bg-white/10 px-3 py-2">Executive Dashboard</a>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Create Wiki Entry</h2>
          <form className="mt-3 grid gap-2" onSubmit={onSubmit}>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border px-3 py-2">
              <option>SOP</option>
              <option>Snippet</option>
              <option>Template</option>
              <option>Documentation</option>
              <option>Checklist</option>
            </select>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="rounded border px-3 py-2" />
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Body" rows={5} className="rounded border px-3 py-2" />
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags (comma separated)" className="rounded border px-3 py-2" />
            <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Save Entry</button>
          </form>
        </section>

        <section className="grid gap-3">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{entry.category}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{entry.body}</p>
              <p className="mt-2 text-xs text-slate-500">Tags: {(entry.tags || []).join(', ') || 'none'}</p>
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
        destination: '/login?callbackUrl=/back-office/wiki',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
