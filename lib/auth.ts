import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto'

const HASH_ENCODING = 'hex'
const SCRYPT_KEYLEN = 64

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString(HASH_ENCODING)
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString(HASH_ENCODING)
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const derived = scryptSync(password, salt, SCRYPT_KEYLEN)
  const storedBuffer = Buffer.from(hash, HASH_ENCODING)

  if (storedBuffer.length !== derived.length) return false
  return timingSafeEqual(storedBuffer, derived)
}

export function createResetToken() {
  return randomBytes(24).toString(HASH_ENCODING)
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest(HASH_ENCODING)
}

export const hashResetToken = hashToken