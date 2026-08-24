import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto'
import bcrypt from 'bcryptjs'

const HASH_ENCODING = 'hex'
const SCRYPT_KEYLEN = 64

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const BCRYPT_ROUNDS = () => parsePositiveInt(process.env.BCRYPT_SALT_ROUNDS, 12)

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS())
}

export function verifyPassword(password: string, stored: string) {
  if (isBcryptHash(stored)) {
    return bcrypt.compareSync(password, stored)
  }

  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const derived = scryptSync(password, salt, SCRYPT_KEYLEN)
  const storedBuffer = Buffer.from(hash, HASH_ENCODING)

  if (storedBuffer.length !== derived.length) return false
  return timingSafeEqual(storedBuffer, derived)
}

export function isBcryptHash(stored: string) {
  return /^\$2[aby]\$\d{2}\$/.test(stored)
}

export function isLegacyPasswordHash(stored: string) {
  return !isBcryptHash(stored)
}

export function createResetToken() {
  return randomBytes(24).toString(HASH_ENCODING)
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest(HASH_ENCODING)
}

export const hashResetToken = hashToken