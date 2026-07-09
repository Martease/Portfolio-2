import type { NextApiRequest, NextApiResponse } from 'next'

export function ensureMethod(req: NextApiRequest, res: NextApiResponse, allowed: string[]) {
  const method = req.method || 'GET'
  if (allowed.includes(method)) return true

  res.setHeader('Allow', allowed)
  res.status(405).json({ message: `Method ${method} Not Allowed` })
  return false
}

export function queryString(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return undefined
}

export function queryInt(
  value: string | string[] | undefined,
  options: { min: number; max: number; fallback: number }
) {
  const single = queryString(value)
  if (!single) return options.fallback

  const parsed = Number(single)
  if (!Number.isInteger(parsed)) return options.fallback

  return Math.max(options.min, Math.min(options.max, parsed))
}
