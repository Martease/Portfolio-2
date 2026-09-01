/**
 * Centralized configuration and constants for the application
 * This file contains all magic numbers, defaults, and configuration values
 */

// ===== PASSWORD & AUTH CONSTANTS =====
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
export const PASSWORD_REQUIREMENTS =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'

// ===== EMAIL CONSTANTS =====
export const EMAIL_MAX_LENGTH = 200
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DEFAULT_CONTACT_EMAIL = 'contact@mamvolabs.com'

// ===== STRING VALIDATION =====
export const STRING_MAX_LENGTH = 4000
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 120
export const CONTRACT_ID_PATTERN = /^[A-Za-z0-9_-]+$/
export const CONTRACT_ID_MIN_LENGTH = 3
export const CONTRACT_ID_MAX_LENGTH = 64

// ===== TOKEN CONSTANTS =====
export const TOKEN_BYTES = 32
export const TOKEN_EXPIRY_MINUTES = 30
export const SCRYPT_KEYLEN = 64

// ===== RATE LIMITING =====
export const DEFAULT_ADMIN_MUTATION_WINDOW_MS = 60_000
export const DEFAULT_ADMIN_MUTATION_MAX = 30
export const DEFAULT_FILE_SUBMIT_WINDOW_MS = 60_000
export const DEFAULT_FILE_SUBMIT_MAX = 20
export const DEFAULT_SIGNED_COPY_SUBMIT_WINDOW_MS = 60_000
export const DEFAULT_SIGNED_COPY_SUBMIT_MAX = 10

// ===== FORM CONSTRAINTS =====
export const FORM_MESSAGE_MAX_LENGTH = 1000
export const FORM_NOTE_MAX_LENGTH = 4000
export const SERVICE_NAME_MIN_LENGTH = 2
export const SERVICE_NAME_MAX_LENGTH = 120

// ===== PAYMENT AMOUNTS =====
export const PAYMENT_MIN_CENTS = 100 // $1.00
export const PAYMENT_MAX_CENTS = 50_000_000 // $500,000.00
export const STRIPE_CURRENCY = 'usd'

// ===== SESSION & JWT =====
export const DEFAULT_SESSION_MAXAGE_SECONDS = 24 * 60 * 60 // 24 hours
export const REMEMBER_ME_SESSION_MAXAGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

// ===== DATABASE =====
export const PAGINATION_MAX_RESULTS = 1000
export const DASHBOARD_DEADLINE_DAYS_AHEAD = 14
export const DASHBOARD_OVERVIEW_DAYS_AHEAD = 30
export const DASHBOARD_MAX_MESSAGES = 8

// ===== API RESPONSES =====
export const GENERIC_ERROR_MESSAGE = 'An error occurred. Please try again later.'
export const GENERIC_AUTH_ERROR_MESSAGE = 'Invalid email or password.'
export const INVALID_REQUEST_MESSAGE = 'Invalid request'

/**
 * Validates a password meets complexity requirements
 * @param password - The password to validate
 * @returns true if password meets requirements, false otherwise
 */
export function isValidPassword(password: string): boolean {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return false
  }
  return PASSWORD_PATTERN.test(password)
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > EMAIL_MAX_LENGTH) {
    return false
  }
  return EMAIL_PATTERN.test(email)
}

/**
 * Gets an environment variable or returns a default
 * In production, throws if the variable is required but missing
 * @param key - Environment variable key
 * @param fallback - Default value if not found
 * @param required - If true and in production, throws if missing
 */
export function getEnvVar(key: string, fallback?: string, required = false): string {
  const value = process.env[key]

  if (value) {
    return value
  }

  if (required && process.env.NODE_ENV === 'production') {
    throw new Error(`Required environment variable ${key} is not set`)
  }

  if (fallback !== undefined) {
    return fallback
  }

  throw new Error(`Environment variable ${key} is not set`)
}
