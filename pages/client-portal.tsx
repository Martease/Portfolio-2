import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getServerSession } from 'next-auth/next'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { authOptions } from './api/auth/[...nextauth]'

const API_BASE = '/api'

export default function ClientPortal({ contractId }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession()
  const [dashboard, setDashboard] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboard()
    }
  }, [status, session])

  async function fetchDashboard() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/client/dashboard`)
      if (res.ok) {
        const data = await res.json()
        setDashboard(data)
      } else {
        const body = await res.json().catch(() => ({} as { message?: string }))
        setError(body.message || 'Failed to load dashboard.')
        setDashboard(null)
      }
    } catch (e) {
      console.error(e)
      setError('Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) return <p>Loading...</p>
  if (!session) return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Client Portal</h2>
      <p className="mb-4">You must sign in to view your contracts.</p>
      <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</a>
    </div>
  )

  if (session.user?.role === 'admin') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Admin Session Detected</h2>
        <p className="mb-4">Use Back Office for admin operations.</p>
        <div className="flex gap-3">
          <a href="/back-office" className="px-4 py-2 rounded bg-blue-600 text-white">Go to Back Office</a>
          <button className="px-4 py-2 rounded bg-gray-200" onClick={() => signOut({ callbackUrl: '/login' })}>Logout</button>
        </div>
      </div>
    )
  }

  if (!contractId) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Client Portal</h2>
        <p className="mb-4">No contract is linked to your account yet.</p>
        <button className="px-4 py-2 rounded bg-gray-200" onClick={() => signOut({ callbackUrl: '/login' })}>Logout</button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Client Portal</h2>
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Logout
        </button>
      </div>
      {error ? <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p> : null}

      {!dashboard?.activeProject ? (
        <div className="bg-white rounded-lg p-6 shadow">No active project found for your account.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Active Project</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.activeProject.title}</p>
              <p className="mt-1 text-sm text-slate-600">Status: {dashboard.activeProject.status}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard.progress.percent}%</p>
              <p className="mt-1 text-sm text-slate-600">{dashboard.progress.completedTasks} / {dashboard.progress.totalTasks} tasks done</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Contracts</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard.contracts.length}</p>
              <p className="mt-1 text-sm text-slate-600">Latest versions available</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Invoices</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard.invoices.length}</p>
              <p className="mt-1 text-sm text-slate-600">Open and paid history</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {dashboard.timeline.length === 0 && <li>No timeline events yet.</li>}
                {dashboard.timeline.slice(0, 6).map((item: any) => (
                  <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">{new Date(item.event_date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {dashboard.notifications.length === 0 && <li>No notifications.</li>}
                {dashboard.notifications.slice(0, 6).map((item: any) => (
                  <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">{item.message}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Contracts</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {dashboard.contracts.length === 0 && <li>No contract documents available.</li>}
                {dashboard.contracts.slice(0, 5).map((item: any) => (
                  <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="font-medium">{item.title}</p>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {item.pdf_url ? (
                        <a href={item.pdf_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                          Client download (PDF)
                        </a>
                      ) : null}
                      {item.signed_copy_available ? (
                        <a href={`/api/client/contracts/${item.id}/download-signed-copy`} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                          Signed copy
                        </a>
                      ) : (
                        <span className="text-slate-500">Awaiting signed copy</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Files</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {dashboard.files.length === 0 && <li>No files uploaded yet.</li>}
                {dashboard.files.slice(0, 5).map((item: any) => (
                  <li key={item.id}>
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">{item.file_name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {dashboard.invoices.length === 0 && <li>No invoices available.</li>}
                {dashboard.invoices.slice(0, 5).map((item: any) => (
                  <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="font-medium">{item.invoice_number} - {(item.amount_cents / 100).toLocaleString()} {item.currency}</p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/client-portal/project" className="rounded-lg bg-slate-900 px-4 py-2 text-white">Open Project Workspace</a>
            <a href="/client-portal/google-workspace" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800">Google Workspace</a>
            <a href="/client-portal/contracts" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800">Contracts Module</a>
          </div>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    const callbackUrl = encodeURIComponent('/client-portal')
    return {
      redirect: {
        destination: `/login?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    }
  }

  if (session.user.role === 'admin') {
    return {
      redirect: {
        destination: '/back-office',
        permanent: false,
      },
    }
  }

  return {
    props: {
      contractId: session.user.contractId || null,
    },
  }
}
