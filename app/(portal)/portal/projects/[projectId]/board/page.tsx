import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../../../../../pages/api/auth/[...nextauth]'
import { getProjectByContract, getWorkspaceByProject } from '../../../../../../../lib/clientPortalStore'

type BoardPageProps = {
  params: {
    projectId: string
  }
}

type BoardColumn = 'Completed' | 'In Progress' | 'Up Next' | 'Waiting On Client'

function normalizeTaskStatus(status: string): BoardColumn {
  const normalized = status.toLowerCase()

  if (normalized === 'done') return 'Completed'
  if (normalized === 'completed') return 'Completed'
  if (normalized === 'in progress') return 'In Progress'
  if (normalized === 'blocked') return 'Waiting On Client'
  return 'Up Next'
}

const columns: BoardColumn[] = ['Completed', 'In Progress', 'Up Next', 'Waiting On Client']

export default async function ProjectBoardPage({ params }: BoardPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/portal/login?callbackUrl=${encodeURIComponent(`/portal/projects/${params.projectId}/board`)}`)
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

  const grouped = columns.reduce<Record<BoardColumn, typeof workspace.tasks>>((acc, column) => {
    acc[column] = workspace.tasks.filter((task) => normalizeTaskStatus(task.status) === column)
    return acc
  }, {
    Completed: [],
    'In Progress': [],
    'Up Next': [],
    'Waiting On Client': [],
  })

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Project Board</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{project.title}</h1>
        </div>
        <a href="/portal/dashboard" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800">
          Back to dashboard
        </a>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <article key={column} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">{column}</h2>
            <ul className="mt-3 space-y-2">
              {grouped[column].length === 0 ? <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">No tasks.</li> : null}
              {grouped[column].map((task) => (
                <li key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Status: {task.status}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  )
}
