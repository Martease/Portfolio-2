const DEFAULT_CONTACT_EMAIL = 'contact@mamvolabs.com'

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || (() => {
  if (process.env.NODE_ENV === 'production' && !process.env.CONTACT_EMAIL) {
    throw new Error('CONTACT_EMAIL environment variable is required in production')
  }
  return DEFAULT_CONTACT_EMAIL
})()