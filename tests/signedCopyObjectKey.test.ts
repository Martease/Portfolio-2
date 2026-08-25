import { describe, expect, it } from 'vitest'
import { buildSignedCopyObjectKey } from '../lib/r2SignedCopies'

describe('signed copy object key generation', () => {
  it('generates server-side opaque keys with deterministic structure and random suffix', () => {
    const keyA = buildSignedCopyObjectKey({ contractId: 'contract-1', documentId: 42 })
    const keyB = buildSignedCopyObjectKey({ contractId: 'contract-1', documentId: 42 })

    expect(keyA).toMatch(/^contracts\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\/signed\/[a-f0-9-]+\.pdf$/)
    expect(keyB).toMatch(/^contracts\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\/signed\/[a-f0-9-]+\.pdf$/)
    expect(keyA).not.toEqual(keyB)
    expect(keyA).not.toContain('client-uploaded-name')
  })
})
