import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { isBackOfficeAuthenticated } from '../lib/backOfficeAuth'

type Contract = {
  id: number
  contract_id: string
  client_name: string
  amount_due_cents: number
  currency: string
  payment_status: string
  payment_link: string | null
}

type NewContractForm = {
  contract_id: string
  client_name: string
  amount_due: string
  currency: string
  payment_status: string
}

const initialForm: NewContractForm = {
  contract_id: '',
  client_name: '',
  amount_due: '',
  currency: 'USD',
  payment_status: 'Pending',
}

const formatMoney = (amountInCents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
  }).format(amountInCents / 100)
}

export default function BackOfficePage({ authenticated }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [form, setForm] = useState<NewContractForm>(initialForm)
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [workingContractId, setWorkingContractId] = useState<string | null>(null)
  const [workingDocContractId, setWorkingDocContractId] = useState<string | null>(null)

  const contractCount = useMemo(() => contracts.length, [contracts])
  const openInvoices = useMemo(
    () => contracts.filter((item) => item.payment_status.toLowerCase() !== 'paid').length,
    [contracts]
  )

  async function signInBackOffice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setAuthLoading(true)

    try {
      const res = await fetch('/api/back-office/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to sign in')
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setAuthLoading(false)
    }
  }

  async function signOutBackOffice() {
    setError('')
    setSuccess('')
    setAuthLoading(true)

    try {
      await fetch('/api/back-office/auth', { method: 'DELETE' })
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  async function loadContracts() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contracts')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load contracts')
      }

      const data = (await res.json()) as Contract[]
      setContracts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadContracts()
    }
  }, [authenticated])

  async function createContract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const amount = Number(form.amount_due)
    if (!form.contract_id || !form.client_name || !Number.isFinite(amount) || amount <= 0) {
      setError('Please enter contract ID, client name, and a valid amount due.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_id: form.contract_id,
          client_name: form.client_name,
          amount_due_cents: Math.round(amount * 100),
          currency: form.currency.toUpperCase(),
          payment_status: form.payment_status,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to create contract')
      }

      setForm(initialForm)
      setSuccess('Contract created successfully.')
      await loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract')
    } finally {
      setSubmitting(false)
    }
  }

  async function generatePaymentLink(contractId: string) {
    setWorkingContractId(contractId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/contracts/${contractId}/create-payment-link`, {
        method: 'POST',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to create payment link')
      }

      const body = (await res.json()) as { payment_link?: string }
      if (!body.payment_link) {
        throw new Error('Payment link did not return from API')
      }

      setContracts((current) =>
        current.map((item) =>
          item.contract_id === contractId ? { ...item, payment_link: body.payment_link || null } : item
        )
      )
      setSuccess(`Payment link created for ${contractId}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link')
    } finally {
      setWorkingContractId(null)
    }
  }

  async function generateGoogleDoc(contractId: string) {
    setWorkingDocContractId(contractId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/back-office/google-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId }),
      })

      const body = await res.json().catch(() => ({} as { message?: string; docUrl?: string }))

      if (!res.ok) {
        throw new Error(body.message || 'Failed to start Google Docs action')
      }

      setSuccess(body.message || `Google Docs action completed for ${contractId}.`)
      if (body.docUrl) {
        window.open(body.docUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Google Docs action')
    } finally {
      setWorkingDocContractId(null)
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Owner Access</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Back Office</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your passcode to access contracts and Stripe controls.</p>

          <form className="mt-6 space-y-3" onSubmit={signInBackOffice}>
            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="Back office passcode"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-black disabled:opacity-60"
            >
              {authLoading ? 'Signing in...' : 'Enter Back Office'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Mamvo Labs</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Back Office</h1>
              <p className="mt-2 text-slate-200">Manage contracts, monitor invoices, and generate Stripe payment links.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-3 py-1">Contracts: {contractCount}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Open Invoices: {openInvoices}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutBackOffice}
              disabled={authLoading}
              className="rounded-xl border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {authLoading ? 'Working...' : 'Sign out'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px,1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Create Contract</h2>
            <p className="mt-1 text-sm text-slate-600">Add a new contract and amount due.</p>

            <form className="mt-5 space-y-3" onSubmit={createContract}>
              <input
                value={form.contract_id}
                onChange={(event) => setForm((prev) => ({ ...prev, contract_id: event.target.value }))}
                placeholder="Contract ID (e.g. CTR-010)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <input
                value={form.client_name}
                onChange={(event) => setForm((prev) => ({ ...prev, client_name: event.target.value }))}
                placeholder="Client name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <input
                value={form.amount_due}
                onChange={(event) => setForm((prev) => ({ ...prev, amount_due: event.target.value }))}
                placeholder="Amount due (e.g. 1299)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.currency}
                  onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                  placeholder="Currency"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
                <input
                  value={form.payment_status}
                  onChange={(event) => setForm((prev) => ({ ...prev, payment_status: event.target.value }))}
                  placeholder="Status"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Contract'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Contracts</h2>
              <button
                type="button"
                onClick={loadContracts}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>

            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-2 py-2 font-medium">Contract</th>
                    <th className="px-2 py-2 font-medium">Client</th>
                    <th className="px-2 py-2 font-medium">Amount</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    <th className="px-2 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="px-2 py-4 text-slate-500" colSpan={5}>Loading contracts...</td>
                    </tr>
                  )}

                  {!loading && contracts.length === 0 && (
                    <tr>
                      <td className="px-2 py-4 text-slate-500" colSpan={5}>No contracts yet.</td>
                    </tr>
                  )}

                  {!loading &&
                    contracts.map((contract) => (
                      <tr key={contract.id} className="border-b border-slate-100">
                        <td className="px-2 py-3 font-medium text-slate-900">{contract.contract_id}</td>
                        <td className="px-2 py-3 text-slate-700">{contract.client_name}</td>
                        <td className="px-2 py-3 text-slate-700">{formatMoney(contract.amount_due_cents, contract.currency)}</td>
                        <td className="px-2 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{contract.payment_status}</span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={workingDocContractId === contract.contract_id}
                              onClick={() => generateGoogleDoc(contract.contract_id)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:opacity-60"
                            >
                              {workingDocContractId === contract.contract_id ? 'Preparing Doc...' : 'Google Doc'}
                            </button>
                            {contract.payment_link ? (
                              <a
                                href={contract.payment_link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                              >
                                Open Link
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled={workingContractId === contract.contract_id}
                                onClick={() => generatePaymentLink(contract.contract_id)}
                                className="rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 disabled:opacity-60"
                              >
                                {workingContractId === contract.contract_id ? 'Creating...' : 'Generate Link'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const authenticated = isBackOfficeAuthenticated({
    cookies: context.req.cookies,
  })

  return {
    props: {
      authenticated,
    },
  }
}