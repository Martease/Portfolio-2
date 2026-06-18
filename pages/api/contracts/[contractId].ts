import type { NextApiRequest, NextApiResponse } from 'next'
import { getContract } from '../../../lib/contractStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const contractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId

  if (!contractId) {
    return res.status(400).json({ message: 'Contract ID is required' })
  }

  if (req.method === 'GET') {
    const contract = await getContract(contractId)
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }
    return res.status(200).json(contract)
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
