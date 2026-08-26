import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../../pages/api/auth/[...nextauth]'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fadmin%2Fdashboard')
  }

  if (session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
      <p className="mt-3 text-slate-600">App Router control plane scaffold is ready. Existing back-office pages remain active.</p>
      <a href="/back-office" className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Open existing back-office
      </a>
    </main>
  )
}
