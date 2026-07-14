import type { NextApiRequest, NextApiResponse } from 'next'
import { deny, getApiSession, hasRole } from '../../../../lib/authz'
import { getAnalyticsDashboard } from '../../../../lib/businessOsStore'

const esc = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) return deny(res, 401, 'Authentication required')
  if (!hasRole(session.user.role, ['admin'])) return deny(res, 403, 'Admin role required')

  const analytics = await getAnalyticsDashboard()

  const summaryRows = [
    ['metric', 'value'],
    ['revenue_cents', analytics.revenueCents],
    ['projects', analytics.projects],
    ['conversion_rate', analytics.conversionRate.toFixed(2)],
    ['client_retention_rate', analytics.clientRetentionRate.toFixed(2)],
    ['time_tracking_hours', analytics.timeTrackingHours.toFixed(2)],
    ['business_growth_percent', analytics.businessGrowthPercent.toFixed(2)],
  ]

  const revenueRows = [
    ['month', 'revenue_cents'],
    ...analytics.monthlyRevenue.map((item) => [item.month, item.totalCents]),
  ]

  const csv = [
    '# Summary',
    ...summaryRows.map((row) => row.map(esc).join(',')),
    '',
    '# Monthly Revenue',
    ...revenueRows.map((row) => row.map(esc).join(',')),
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.csv"`)
  return res.status(200).send(csv)
}
