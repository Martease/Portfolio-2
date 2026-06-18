import type { NextApiRequest, NextApiResponse } from 'next'
import { createContract, listContracts } from '../../../lib/contractStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const contracts = await listContracts()
    return res.status(200).json(contracts)
  }

  if (req.method === 'POST') {
    const { contract_id, client_name, amount_due_cents, currency, payment_status } = req.body

    if (!contract_id || !client_name || typeof amount_due_cents !== 'number') {
      return res.status(400).json({ message: 'contract_id, client_name and amount_due_cents are required' })
    }

    try {
      const contract = await createContract({
        contract_id,
        client_name,
        amount_due_cents,
        currency,
        payment_status,
      })
      return res.status(201).json(contract)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
