import { createHmac, randomBytes, randomUUID } from 'crypto'
import type { NextApiRequest } from 'next'
import { query, type DbClientCapabilityRow } from './db'

export const capabilityScopes = [
  'CONTRACT_READ',
  'DASHBOARD_READ',
  'DOCUMENTS_READ',
  'DOWNLOADS_READ',
  'WORKSPACE_READ',
  'FEEDBACK_CREATE',
  'FILE_SUBMIT',
  'SIGNED_COPY_SUBMIT',
  'PAYMENT_CREATE',
] as const

export type CapabilityScope = (typeof capabilityScopes)[number]

export type Capability = Omit<DbClientCapabilityRow, 'scopes'> & {
  scopes: CapabilityScope[]
}

type CreateCapabilityInput = {
  contractId: string
  scopes: CapabilityScope[]
  createdBy: string
  expiresAt: Date
  projectId?: number
  recipientEmail?: string
  maxUses?: number
  replacedById?: string
}

type VerifyCapabilityInput = {
  token: string
  contractId: string
  requiredScopes: CapabilityScope | CapabilityScope[]
  projectId?: number
  consume?: boolean
}

const TOKEN_PREFIX = 'cap_'
const TOKEN_BYTES = 32

function capabilityPepper() {
  const pepper = process.env.CAPABILITY_TOKEN_PEPPER
  if (!pepper || pepper.trim().length < 32) {
    throw new Error('CAPABILITY_TOKEN_PEPPER must be set to a value of at least 32 characters')
  }
  return pepper
}

function normalizeScopes(scopes: CapabilityScope[]) {
  const uniqueScopes = Array.from(new Set(scopes))
  if (uniqueScopes.length === 0 || uniqueScopes.some((scope) => !capabilityScopes.includes(scope))) {
    throw new Error('At least one valid capability scope is required')
  }
  return uniqueScopes
}

function toCapability(row: DbClientCapabilityRow): Capability {
  return {
    ...row,
    scopes: row.scopes as CapabilityScope[],
  }
}

/**
 * Generates a new capability token with cryptographically secure random bytes
 * @returns Token string starting with 'cap_' prefix
 */
export function generateCapabilityToken() {
  return `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString('base64url')}`
}

/**
 * Hashes a capability token using HMAC-SHA256 with environment pepper
 * Used to safely store tokens in database
 * @param token - The capability token to hash
 * @returns Hex-encoded hash
 * @throws Error if token format is invalid
 */
export function hashCapabilityToken(token: string) {
  if (!token.startsWith(TOKEN_PREFIX) || token.length < TOKEN_PREFIX.length + 32) {
    throw new Error('Invalid capability token format')
  }

  return createHmac('sha256', capabilityPepper()).update(token).digest('hex')
}

/**
 * Creates a capability audit subject string for logging
 * @param capabilityId - The capability ID
 * @returns Audit subject for logging
 */
export function capabilityAuditSubject(capabilityId: string) {
  return `capability:${capabilityId}`
}

/**
 * Extracts capability token from request headers or cookies
 * Checks Authorization: Bearer header first, then capability_token cookie
 * @param req - Request with headers and cookies
 * @returns Token string if found, undefined otherwise
 */
export function extractCapabilityToken(req: Pick<NextApiRequest, 'headers' | 'cookies'>) {
  const authorization = req.headers.authorization
  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim() || undefined
  }

  return req.cookies.capability_token || undefined
}

/**
 * Creates a new capability token in the database
 * @param input - Capability creation parameters including contract, scopes, and expiration
 * @returns Object with token (plaintext) and capability metadata
 * @throws Error if input validation fails
 */
export async function createCapability(input: CreateCapabilityInput) {
  const scopes = normalizeScopes(input.scopes)
  const contractId = input.contractId.trim()
  const createdBy = input.createdBy.trim()

  if (!contractId || !createdBy || !Number.isFinite(input.expiresAt.getTime()) || input.expiresAt <= new Date()) {
    throw new Error('Capability contract, creator, and future expiration are required')
  }

  if (input.maxUses !== undefined && (!Number.isInteger(input.maxUses) || input.maxUses < 1)) {
    throw new Error('maxUses must be a positive integer')
  }

  const token = generateCapabilityToken()
  const tokenHash = hashCapabilityToken(token)
  const result = await query<DbClientCapabilityRow>(
    `INSERT INTO client_capability (
       id, token_hash, contract_id, project_id, scopes, recipient_email,
       created_by, expires_at, max_uses, replaced_by_id
     )
     VALUES ($1, $2, $3, $4, $5::capability_scope[], $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      randomUUID(),
      tokenHash,
      contractId,
      input.projectId || null,
      scopes,
      input.recipientEmail?.trim() || null,
      createdBy,
      input.expiresAt.toISOString(),
      input.maxUses || null,
      input.replacedById || null,
    ]
  )

  return {
    capability: toCapability(result.rows[0]),
    token,
  }
}

export async function verifyCapability(input: VerifyCapabilityInput): Promise<Capability | null> {
  const requiredScopes = normalizeScopes(
    Array.isArray(input.requiredScopes) ? input.requiredScopes : [input.requiredScopes]
  )
  const tokenHash = hashCapabilityToken(input.token)
  const consume = Boolean(input.consume)
  const projectId = input.projectId ?? null
  const usageCondition = consume ? 'AND (max_uses IS NULL OR use_count < max_uses)' : ''
  const usageUpdate = consume ? 'use_count = use_count + 1,' : ''

  const result = await query<DbClientCapabilityRow>(
    `UPDATE client_capability
       SET ${usageUpdate} last_used_at = NOW()
     WHERE token_hash = $1
       AND contract_id = $2
       AND scopes @> $3::capability_scope[]
       AND (project_id IS NULL OR project_id = $4)
       AND expires_at > NOW()
       AND revoked_at IS NULL
       ${usageCondition}
     RETURNING *`,
    [tokenHash, input.contractId, requiredScopes, projectId]
  )

  return result.rows[0] ? toCapability(result.rows[0]) : null
}

export async function revokeCapability(capabilityId: string, revokedBy: string, reason?: string) {
  const result = await query<DbClientCapabilityRow>(
    `UPDATE client_capability
       SET revoked_at = COALESCE(revoked_at, NOW()),
           revoked_by = COALESCE(revoked_by, $2),
           revoke_reason = COALESCE(revoke_reason, $3)
     WHERE id = $1
     RETURNING *`,
    [capabilityId, revokedBy, reason || null]
  )

  return result.rows[0] ? toCapability(result.rows[0]) : null
}