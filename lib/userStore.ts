import { hashPassword, hashToken, normalizeEmail, verifyPassword } from './auth'
import {
  query,
  type DbEmailVerificationTokenRow,
  type DbPasswordResetTokenRow,
  type DbUserRow,
} from './db'

export type UserRole = 'admin' | 'client'

export type AppUser = {
  id: string
  name: string
  email: string
  role: UserRole
  contract_id: string | null
}

export type AuthenticateResult =
  | { ok: true; user: AppUser }
  | { ok: false; reason: 'invalid_credentials' | 'email_unverified' | 'account_locked'; retryAt?: string }

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const MAX_FAILED_ATTEMPTS = () => parsePositiveInt(process.env.AUTH_MAX_FAILED_LOGIN_ATTEMPTS, 5)
const LOCKOUT_MINUTES = () => parsePositiveInt(process.env.AUTH_LOCKOUT_MINUTES, 15)

const rowToUser = (row: DbUserRow): AppUser => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  role: row.role as UserRole,
  contract_id: row.contract_id,
})

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const result = await query<DbUserRow>('SELECT * FROM app_user WHERE email = $1', [normalizedEmail])
  if (!result.rows.length) return undefined
  return result.rows[0]
}

export async function findUserById(id: string) {
  const result = await query<DbUserRow>('SELECT * FROM app_user WHERE id = $1', [id])
  if (!result.rows.length) return undefined
  return result.rows[0]
}

export async function findClientEmailByContractId(contractId: string) {
  const result = await query<{ email: string }>(
    `SELECT email
     FROM app_user
     WHERE role = 'client' AND contract_id = $1
     ORDER BY id ASC
     LIMIT 1`,
    [contractId]
  )

  return result.rows[0]?.email || undefined
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email)
  if (!user) return { ok: false, reason: 'invalid_credentials' } as const

  const lockoutUntil = user.lockout_until ? new Date(user.lockout_until) : null
  if (lockoutUntil && lockoutUntil.getTime() > Date.now()) {
    return {
      ok: false,
      reason: 'account_locked',
      retryAt: lockoutUntil.toISOString(),
    } as const
  }

  if (!verifyPassword(password, user.password_hash)) {
    const failedAttempts = user.failed_login_attempts + 1
    const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS()
    const nextLockoutUntil = shouldLock
      ? new Date(Date.now() + LOCKOUT_MINUTES() * 60 * 1000)
      : null

    await query(
      `UPDATE app_user
         SET failed_login_attempts = $1,
             lockout_until = $2,
             updated_at = NOW()
         WHERE id = $3`,
      [failedAttempts, nextLockoutUntil ? nextLockoutUntil.toISOString() : null, user.id]
    )

    if (shouldLock && nextLockoutUntil) {
      return {
        ok: false,
        reason: 'account_locked',
        retryAt: nextLockoutUntil.toISOString(),
      } as const
    }

    return { ok: false, reason: 'invalid_credentials' } as const
  }

  if (!user.email_verified_at) {
    return { ok: false, reason: 'email_unverified' } as const
  }

  if (user.failed_login_attempts > 0 || user.lockout_until) {
    await query(
      `UPDATE app_user
         SET failed_login_attempts = 0,
             lockout_until = NULL,
             updated_at = NOW()
         WHERE id = $1`,
      [user.id]
    )
  }

  return { ok: true, user: rowToUser(user) } as const
}

export async function createUser(params: {
  name: string
  email: string
  password: string
  role: UserRole
  contractId?: string
}) {
  const normalizedEmail = normalizeEmail(params.email)
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const passwordHash = hashPassword(params.password)
  const result = await query<DbUserRow>(
    `INSERT INTO app_user (name, email, password_hash, role, contract_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [params.name.trim(), normalizedEmail, passwordHash, params.role, params.contractId || null]
  )

  return rowToUser(result.rows[0])
}

export async function createPasswordReset(params: {
  userId: string
  token: string
  expiresAt: Date
}) {
  const tokenHash = hashToken(params.token)
  await query(
    `INSERT INTO password_reset_token (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [params.userId, tokenHash, params.expiresAt.toISOString()]
  )
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token)
  const result = await query<DbPasswordResetTokenRow>(
    `SELECT * FROM password_reset_token
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [tokenHash]
  )

  if (!result.rows.length) {
    return null
  }

  const tokenRow = result.rows[0]
  await query('UPDATE password_reset_token SET used_at = NOW() WHERE id = $1', [tokenRow.id])
  return tokenRow
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const passwordHash = hashPassword(newPassword)
  await query('UPDATE app_user SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId])
}

export async function createEmailVerification(params: {
  userId: string
  token: string
  expiresAt: Date
}) {
  const tokenHash = hashToken(params.token)
  await query(
    `INSERT INTO email_verification_token (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [params.userId, tokenHash, params.expiresAt.toISOString()]
  )
}

export async function consumeEmailVerificationToken(token: string) {
  const tokenHash = hashToken(token)
  const result = await query<DbEmailVerificationTokenRow>(
    `SELECT * FROM email_verification_token
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [tokenHash]
  )

  if (!result.rows.length) {
    return null
  }

  const tokenRow = result.rows[0]
  await query('UPDATE email_verification_token SET used_at = NOW() WHERE id = $1', [tokenRow.id])
  return tokenRow
}

export async function markUserEmailVerified(userId: string) {
  await query(
    `UPDATE app_user
       SET email_verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
    [userId]
  )
}