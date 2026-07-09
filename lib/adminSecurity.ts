import type { NextApiRequest, NextApiResponse } from 'next'
import { checkRateLimit } from './rateLimitStore'

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim()
  }

  return req.socket.remoteAddress || 'unknown'
}

export async function enforceAdminMutationRateLimit(req: NextApiRequest, res: NextApiResponse, actorKey: string) {
  const windowMs = parsePositiveInt(process.env.ADMIN_MUTATION_RATE_LIMIT_WINDOW_MS, 60_000)
  const max = parsePositiveInt(process.env.ADMIN_MUTATION_RATE_LIMIT_MAX, 30)
  const scope = `${actorKey}:${getClientIp(req)}`

  const result = await checkRateLimit({ scope, windowMs, max })
  if (!result.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
    res.setHeader('Retry-After', String(retryAfterSeconds))
    res.status(429).json({ message: 'Too many admin mutations. Please try again shortly.' })
    return false
  }

  return true
}

export function validateString(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; pattern?: RegExp } = {}
) {
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`)
  }

  const normalized = value.trim()
  const min = options.min ?? 1
  const max = options.max ?? 2000

  if (normalized.length < min || normalized.length > max) {
    throw new Error(`${field} must be between ${min} and ${max} characters`)
  }

  if (options.pattern && !options.pattern.test(normalized)) {
    throw new Error(`${field} is invalid`)
  }

  return normalized
}

export function validateOptionalString(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; pattern?: RegExp } = {}
) {
  if (value === undefined || value === null || value === '') return undefined
  return validateString(value, field, options)
}

export function validateInteger(value: unknown, field: string, options: { min?: number; max?: number } = {}) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer`)
  }

  const min = options.min ?? Number.MIN_SAFE_INTEGER
  const max = options.max ?? Number.MAX_SAFE_INTEGER

  if (value < min || value > max) {
    throw new Error(`${field} must be between ${min} and ${max}`)
  }

  return value
}

export function validateEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]) {
  if (typeof value !== 'string') {
    throw new Error(`${field} is required`)
  }

  if (!allowed.includes(value as T)) {
    throw new Error(`${field} must be one of: ${allowed.join(', ')}`)
  }

  return value as T
}

export function validateUrl(value: unknown, field: string) {
  const normalized = validateString(value, field, { min: 8, max: 2048 })
  let parsed: URL

  try {
    parsed = new URL(normalized)
  } catch {
    throw new Error(`${field} must be a valid URL`)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${field} must use http or https`)
  }

  return normalized
}

export function validateOptionalTags(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]

  const tags = value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 12)

  return Array.from(new Set(tags))
}
