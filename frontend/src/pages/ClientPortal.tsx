import { useState } from 'react'

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function ClientPortal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (email !== 'client@example.com' || password !== 'secret') {
      setError('Invalid login. Use client@example.com / secret.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/contracts/CTR-001`)
      if (!res.ok) {
        throw new Error('Could not load contract. Is the backend running?')
      }
      const data = await res.json()
      setContract(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const ensurePaymentLink = async () => {
    if (!contract) return
    if (contract.payment_link) {
      window.location.href = contract.payment_link
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/contracts/${contract.contract_id}/create-payment-link`, {
        method: 'POST',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Failed to create payment link')
      }
      const data = await res.json()
      setContract({ ...contract, payment_link: data.payment_link })
      window.location.href = data.payment_link
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 px-6 min-h-screen bg-orange-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold mb-6">Client Portal</h1>

        {!contract ? (
          <div className="bg-white rounded-3xl p-10 shadow-lg">
            <p className="mb-6 text-gray-700">Sign in with your contract credentials to view your invoice and checkout.</p>

            <form className="space-y-4" onSubmit={handleSignIn}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="mt-2 inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-white transition hover:bg-orange-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 shadow-lg">
            <p className="mb-6 text-gray-600">Signed in as <strong>{email}</strong></p>
            <div className="space-y-4 text-gray-700">
              <div>
                <div className="text-sm uppercase tracking-wide text-orange-600">Contract ID</div>
                <div className="text-xl font-semibold">{contract.contract_id}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-orange-600">Client</div>
                <div className="text-xl font-semibold">{contract.client_name}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-orange-600">Amount Due</div>
                <div className="text-xl font-semibold">${(contract.amount_due_cents / 100).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-orange-600">Status</div>
                <div className="text-xl font-semibold">{contract.payment_status}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/" className="rounded-xl border border-orange-600 px-5 py-3 text-orange-600 transition hover:bg-orange-50">Continue shopping</a>
              <button onClick={ensurePaymentLink} className="rounded-xl bg-orange-600 px-5 py-3 text-white transition hover:bg-orange-700" disabled={loading}>
                {loading ? 'Preparing checkout...' : 'Checkout'}
              </button>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
