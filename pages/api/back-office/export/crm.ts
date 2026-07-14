import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../../lib/authz'
import { listCrmClients } from '../../../../lib/businessOsStore'

const esc = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) return deny(res, 401, 'Authentication required')
  if (!hasRole(session.user.role, ['admin'])) return deny(res, 403, 'Admin role required')

  const clients = await listCrmClients()
  const rows = [
    ['client_id', 'name', 'contact_name', 'contact_email', 'contact_phone', 'status', 'tags', 'projects', 'contracts', 'unread_emails'],
    ...clients.map((bundle) => [
      bundle.client.id,
      bundle.client.name,
      bundle.client.contact_name || '',
      bundle.client.contact_email || '',
      bundle.client.contact_phone || '',
      bundle.client.status,
      (bundle.client.tags || []).join('|'),
      bundle.projects.length,
      bundle.contracts.length,
      bundle.emails.filter((email) => email.direction === 'inbound' && !email.is_read).length,
    ]),
  ]

  const csv = rows.map((row) => row.map(esc).join(',')).join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="crm-export-${Date.now()}.csv"`)
  return res.status(200).send(csv)
}
