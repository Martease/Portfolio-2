import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CONTACT_EMAIL } from '../lib/config'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('contact configuration', () => {
  it.each(['production', 'development', 'test'])('uses the existing default without an override in %s', async (environment) => {
    vi.stubEnv('NODE_ENV', environment)
    vi.stubEnv('CONTACT_EMAIL', undefined)

    const { CONTACT_EMAIL } = await import('../lib/contactConfig')

    expect(CONTACT_EMAIL).toBe(DEFAULT_CONTACT_EMAIL)
  })

  it('uses the default when the production override is empty', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CONTACT_EMAIL', '')

    const { CONTACT_EMAIL } = await import('../lib/contactConfig')

    expect(CONTACT_EMAIL).toBe(DEFAULT_CONTACT_EMAIL)
  })

  it('preserves a configured override in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CONTACT_EMAIL', 'configured-inbox')

    const { CONTACT_EMAIL } = await import('../lib/contactConfig')

    expect(CONTACT_EMAIL).toBe('configured-inbox')
  })
})
