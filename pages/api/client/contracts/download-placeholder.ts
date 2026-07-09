import type { NextApiRequest, NextApiResponse } from 'next'
import { validateString } from '../../../../lib/adminSecurity'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const rawContractId = Array.isArray(req.query.contractId) ? req.query.contractId[0] : req.query.contractId
  const rawTitle = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title

  let contractId = 'unknown'
  let title = 'Contract'

  if (typeof rawContractId === 'string' && rawContractId.trim()) {
    contractId = validateString(rawContractId, 'contractId', {
      min: 1,
      max: 64,
      pattern: /^[A-Za-z0-9_-]+$/,
    })
  }

  if (typeof rawTitle === 'string' && rawTitle.trim()) {
    title = validateString(rawTitle, 'title', { min: 1, max: 200 })
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send(
    [
      'Mamvo Labs Contract PDF Placeholder',
      `Contract ID: ${contractId}`,
      `Title: ${title}`,
      '',
      'Wire this endpoint to a real PDF generation pipeline in production.',
    ].join('\n')
  )
}