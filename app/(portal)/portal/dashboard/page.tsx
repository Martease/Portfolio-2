import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../../pages/api/auth/[...nextauth]'
import { getContract } from '../../../../lib/contractStore'
import { ensureProjectByContract, getDashboardByContract } from '../../../../lib/clientPortalStore'

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amountCents / 100)
}

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/portal/login?callbackUrl=%2Fportal%2Fdashboard')
  }

  if (session.user.role === 'admin') {
    redirect('/admin/dashboard')
  }

  const contractId = session.user.contractId
  if (!contractId) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Client Dashboard</h1>
        <p className="mt-3 text-slate-600">No contract is linked to your account yet.</p>
      </main>
    )
  }

  const contract = await getContract(contractId)
  if (!contract) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900">Client Dashboard</h1>
        <p className="mt-3 text-slate-600">Your linked contract could not be found.</p>
      </main>
    )
  }

  await ensureProjectByContract(contract.contract_id, contract.client_name)
  const dashboard = await getDashboardByContract(contract.contract_id)
  const projectId = dashboard?.activeProject?.id

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Bycra Client Portal</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{contract.client_name}</h1>
        </div>
        <a className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800" href="/api/auth/signout">
          Logout
        </a>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Current Project</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard?.activeProject?.title || 'Not started'}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Project Status</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard?.activeProject?.status || 'Unknown'}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Overall Progress</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard?.progress?.percent || 0}%</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Outstanding Invoice</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {dashboard?.invoices?.[0]
              ? formatCurrency(dashboard.invoices[0].amount_cents, dashboard.invoices[0].currency)
              : '$0.00'}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {!dashboard?.timeline?.length ? <li>No timeline events yet.</li> : null}
            {dashboard?.timeline?.slice(0, 6).map((event: any) => (
              <li key={event.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-slate-500">{new Date(event.event_date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-3 grid gap-2 text-sm">
            {projectId ? (
              <a href={`/portal/projects/${projectId}/board`} className="rounded-lg bg-slate-900 px-3 py-2 text-white">Open project board</a>
            ) : (
              <a href="/client-portal/project" className="rounded-lg bg-slate-900 px-3 py-2 text-white">Open project workspace</a>
            )}
            {projectId ? (
              <a href={`/portal/projects/${projectId}/timeline`} className="rounded-lg border border-slate-300 px-3 py-2">View timeline</a>
            ) : null}
            <a href="/client-portal/contracts" className="rounded-lg border border-slate-300 px-3 py-2">View contracts</a>
            <a href="/client-portal/google-workspace" className="rounded-lg border border-slate-300 px-3 py-2">Open documents workspace</a>
          </div>
        </article>
      </section>
    </main>
  )
}
