import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function ClientPortal() {
  const { data: session, status } = useSession()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchContract(session.user.id)
    }
  }, [status, session])

  async function fetchContract(contractId: string) {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}`)
      if (res.ok) {
        const data = await res.json()
        setContract(data)
      } else {
        setContract(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function ensurePaymentLink() {
    if (!contract) return
    if (contract.payment_link) return contract.payment_link

    const res = await fetch(`${API_BASE}/contracts/${contract.contract_id}/create-payment-link`, {
      method: 'POST'
    })
    if (res.ok) {
      const data = await res.json()
      setContract({ ...contract, payment_link: data.payment_link })
      return data.payment_link
    }
    return null
  }

  if (status === 'loading' || loading) return <p>Loading...</p>
  if (!session) return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Client Portal</h2>
      <p className="mb-4">You must sign in to view your contracts.</p>
      <a href="/api/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</a>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Client Portal</h2>
      {!contract ? (
        <div className="bg-white rounded-lg p-6 shadow">No active contract found for your account.</div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow">
          <p><strong>Contract ID:</strong> {contract.contract_id}</p>
          <p><strong>Client:</strong> {contract.client_name}</p>
          <p><strong>Amount Due:</strong> ${(contract.amount_due_cents / 100).toLocaleString()}</p>
          <p><strong>Status:</strong> {contract.payment_status}</p>

          <div className="mt-6 flex gap-3">
            <a href="/" className="px-4 py-2 rounded bg-gray-200">Continue shopping</a>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white"
              onClick={async () => {
                const url = await ensurePaymentLink()
                if (url) window.location.href = url
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
