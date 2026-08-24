import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../../../../../pages/api/auth/[...nextauth]'
import { getProjectByContract, getWorkspaceByProject } from '../../../../../../../lib/clientPortalStore'

type TimelinePageProps = {
  params: {
    projectId: string
  }
}

const stageOrder = [
  'Discovery',
  'Proposal',
  'Agreement',
  'Deposit',
  'Questionnaire',
  'Assets Received',
  'Design',
  'Development',
  'Review',
  'Launch',
  'Website Care',
]

export default async function ProjectTimelinePage({ params }: TimelinePageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/portal/login?callbackUrl=${encodeURIComponent(`/portal/projects/${params.projectId}/timeline`)}`)
  }

  if (session.user.role === 'admin') {
    redirect('/admin/dashboard')
  }

  const contractId = session.user.contractId
  if (!contractId) {
    redirect('/portal/dashboard')
  }

  const project = await getProjectByContract(contractId)
  if (!project || String(project.id) !== params.projectId) {
    redirect('/portal/dashboard')
  }

  const workspace = await getWorkspaceByProject(project.id)

  const timelineMap = new Map(
    workspace.timeline.map((entry) => [entry.title.toLowerCase(), entry])
  )

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Project Timeline</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{project.title}</h1>
        </div>
        <a href="/portal/dashboard" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800">
          Back to dashboard
        </a>
      </header>

      <section className="grid gap-4">
        {stageOrder.map((stage, index) => {
          const event = timelineMap.get(stage.toLowerCase())
          const status = event ? 'Completed' : index === 0 ? 'In Progress' : 'Up Next'
          const progress = event ? 100 : index === 0 ? 35 : 0

          return (
            <article key={stage} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">{stage}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Completion Date: {event ? new Date(event.event_date).toLocaleDateString() : 'Not completed yet'}
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-600">Notes: {event?.detail || 'No notes yet.'}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}
