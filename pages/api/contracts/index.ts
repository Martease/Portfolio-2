import type { NextApiRequest, NextApiResponse } from 'next'
import { createContract, listContracts } from '../../../lib/contractStore'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import {
  enforceAdminMutationRateLimit,
  validateEnum,
  validateInteger,
  validateOptionalString,
  validateString,
} from '../../../lib/adminSecurity'
import { logAdminAudit } from '../../../lib/auditLogStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  if (req.method === 'GET') {
    const contracts = await listContracts()
    return res.status(200).json(contracts)
  }

  if (req.method === 'POST') {
    if (!await enforceAdminMutationRateLimit(req, res, `${session.user.email || 'admin'}:contracts:create`)) {
      return
    }

    try {
      const payload = (req.body || {}) as Record<string, unknown>
      const contract_id = validateString(payload.contract_id, 'contract_id', {
        min: 3,
        max: 64,
        pattern: /^[A-Za-z0-9_-]+$/,
      })
      const client_name = validateString(payload.client_name, 'client_name', { min: 2, max: 120 })
      const amount_due_cents = validateInteger(payload.amount_due_cents, 'amount_due_cents', { min: 1, max: 2_000_000_000 })
      const currency = (validateOptionalString(payload.currency, 'currency', {
        min: 3,
        max: 3,
        pattern: /^[A-Za-z]{3}$/,
      }) || 'USD').toUpperCase()
      const rawPaymentStatus = validateOptionalString(payload.payment_status, 'payment_status', { min: 2, max: 32 })
      const payment_status = rawPaymentStatus
        ? validateEnum(rawPaymentStatus, 'payment_status', ['Pending', 'Paid', 'Open', 'Overdue', 'Cancelled'] as const)
        : 'Pending'

      const contract = await createContract({
        contract_id,
        client_name,
        amount_due_cents,
        currency,
        payment_status,
      })

      await logAdminAudit({
        actorEmail: session.user.email || 'admin@local',
        actorRole: session.user.role || 'admin',
        action: 'contract.create',
        entityType: 'contract',
        entityId: contract.contract_id,
        metadata: {
          client_name: contract.client_name,
          amount_due_cents: contract.amount_due_cents,
          currency: contract.currency,
        },
      })

      return res.status(201).json(contract)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      return res.status(400).json({ message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
