import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth/next'
import { useSession } from 'next-auth/react'
import { FormEvent, useEffect, useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'

type WorkspaceResponse = {
  project: { id: number; title: string; status: string; progress_percent: number }
  milestones: Array<{ id: number; title: string; due_date: string | null; completed: boolean }>
  tasks: Array<{ id: number; title: string; assignee: string | null; status: string }>
  deliverables: Array<{ id: number; title: string; description: string | null; status: string }>
  notes: Array<{ id: number; body: string; note_type: string; author_role: string }>
  feedback: Array<{ id: number; body: string; author_role: string }>
  timeline: Array<{ id: number; title: string; detail: string | null; event_date: string }>
  files: Array<{ id: number; file_name: string; file_url: string }>
}

export default function ClientProjectPage() {
  const { data: session, status } = useSession()
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null)
  const [error, setError] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [deliverableTitle, setDeliverableTitle] = useState('')
  const [deliverableDescription, setDeliverableDescription] = useState('')
  const [timelineTitle, setTimelineTitle] = useState('')
  const [timelineDetail, setTimelineDetail] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [feedbackBody, setFeedbackBody] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  async function loadWorkspace() {
    const res = await fetch('/api/client/workspace')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Failed to load workspace')
      return
    }
    setWorkspace(data)
    setError('')
  }

  useEffect(() => {
    if (status === 'authenticated') {
      loadWorkspace()
    }
  }, [status])

  async function runAction(body: Record<string, unknown>) {
    const res = await fetch('/api/client/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'Action failed')
      return
    }
    setWorkspace(data)
    setError('')
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault()
    if (!taskTitle) return
    await runAction({ action: 'addTask', title: taskTitle })
    setTaskTitle('')
  }

  async function submitMilestone(event: FormEvent) {
    event.preventDefault()
    if (!milestoneTitle) return
    await runAction({ action: 'addMilestone', title: milestoneTitle })
    setMilestoneTitle('')
  }

  async function submitDeliverable(event: FormEvent) {
    event.preventDefault()
    if (!deliverableTitle) return
    await runAction({
      action: 'addDeliverable',
      title: deliverableTitle,
      description: deliverableDescription || undefined,
    })
    setDeliverableTitle('')
    setDeliverableDescription('')
  }

  async function submitTimelineEvent(event: FormEvent) {
    event.preventDefault()
    if (!timelineTitle) return
    await runAction({
      action: 'addTimelineEvent',
      title: timelineTitle,
      detail: timelineDetail || undefined,
    })
    setTimelineTitle('')
    setTimelineDetail('')
  }

  async function submitNote(event: FormEvent) {
    event.preventDefault()
    if (!noteBody) return
    await runAction({ action: 'addNote', body: noteBody })
    setNoteBody('')
  }

  async function submitFeedback(event: FormEvent) {
    event.preventDefault()
    if (!feedbackBody) return
    await runAction({ action: 'addFeedback', body: feedbackBody })
    setFeedbackBody('')
  }

  async function submitFile(event: FormEvent) {
    event.preventDefault()
    if (!fileName || !fileUrl) return
    await runAction({ action: 'addFile', fileName, fileUrl })
    setFileName('')
    setFileUrl('')
  }

  if (status === 'loading') return <p className="p-8">Loading...</p>
  if (!session) return <p className="p-8">Please sign in.</p>

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Project Workspace</h1>
      <p className="mt-2 text-slate-600">Milestones, timeline, tasks, deliverables, notes, files, and feedback in one place.</p>
      <div className="mt-4 flex gap-3">
        <a href="/client-portal" className="rounded-lg bg-slate-200 px-3 py-2">Back to Dashboard</a>
      </div>
      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

      {!workspace ? null : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Milestones</h2>
            <form className="mt-2 flex gap-2" onSubmit={submitMilestone}>
              <input value={milestoneTitle} onChange={(event) => setMilestoneTitle(event.target.value)} placeholder="New milestone" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Add</button>
            </form>
            <ul className="mt-2 space-y-2 text-sm">
              {workspace.milestones.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.title}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Timeline</h2>
            <form className="mt-2 grid gap-2" onSubmit={submitTimelineEvent}>
              <input value={timelineTitle} onChange={(event) => setTimelineTitle(event.target.value)} placeholder="Timeline event title" className="w-full rounded border px-3 py-2" />
              <input value={timelineDetail} onChange={(event) => setTimelineDetail(event.target.value)} placeholder="Event detail (optional)" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Add Event</button>
            </form>
            <ul className="mt-2 space-y-2 text-sm">
              {workspace.timeline.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.title}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Tasks</h2>
            <form className="mt-2 flex gap-2" onSubmit={submitTask}>
              <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="New task" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Add</button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {workspace.tasks.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2">
                  <span>{item.title}</span>
                  <select
                    value={item.status}
                    onChange={(event) => runAction({ action: 'setTaskStatus', taskId: item.id, status: event.target.value })}
                    className="rounded border px-2 py-1"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Deliverables</h2>
            <form className="mt-2 grid gap-2" onSubmit={submitDeliverable}>
              <input value={deliverableTitle} onChange={(event) => setDeliverableTitle(event.target.value)} placeholder="Deliverable title" className="w-full rounded border px-3 py-2" />
              <input value={deliverableDescription} onChange={(event) => setDeliverableDescription(event.target.value)} placeholder="Deliverable description (optional)" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Add Deliverable</button>
            </form>
            <ul className="mt-2 space-y-2 text-sm">
              {workspace.deliverables.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.title}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Notes</h2>
            <form className="mt-2 flex gap-2" onSubmit={submitNote}>
              <input value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="New note" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Add</button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {workspace.notes.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.body}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold text-slate-900">Feedback</h2>
            <form className="mt-2 flex gap-2" onSubmit={submitFeedback}>
              <input value={feedbackBody} onChange={(event) => setFeedbackBody(event.target.value)} placeholder="Leave feedback" className="w-full rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Send</button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {workspace.feedback.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">{item.body}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4 lg:col-span-2">
            <h2 className="font-semibold text-slate-900">Files</h2>
            <form className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={submitFile}>
              <input value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="File name" className="rounded border px-3 py-2" />
              <input value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} placeholder="File URL" className="rounded border px-3 py-2" />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Upload</button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {workspace.files.map((item) => (
                <li key={item.id}>
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">{item.file_name}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    const callbackUrl = encodeURIComponent('/client-portal/project')
    return {
      redirect: {
        destination: `/login?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    }
  }

  if (!session.user.role || !['client', 'admin'].includes(session.user.role)) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return { props: {} }
}