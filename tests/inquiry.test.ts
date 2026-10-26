import { describe, expect, it } from 'vitest'
import { InquirySchema, inquiryToDiscovery, inquiryServices, inquiryBudgets, inquiryTimelines } from '../lib/inquiry'

const valid = {
  inquiryVersion: 1, fullName: 'Avery Studio', email: 'avery@example.com',
  services: [inquiryServices[0], inquiryServices[2]], business: 'An independent ceramics shop.',
  goals: 'Make it easier to shop online.', budgetRange: inquiryBudgets[0],
  timeline: inquiryTimelines[4], serviceType: 'business',
}
describe('client inquiry validation and legacy mapping', () => {
  it('accepts multiple services and optional details', () => {
    expect(InquirySchema.safeParse(valid).success).toBe(true)
  })
  it.each(['fullName', 'email', 'business', 'goals', 'budgetRange', 'timeline'])('rejects a missing required %s', field => {
    expect(InquirySchema.safeParse({ ...valid, [field]: '' }).success).toBe(false)
  })
  it('rejects no services, unknown services, whitespace and excessive text', () => {
    for (const change of [{ services: [] }, { services: ['Unknown'] }, { goals: '   ' }, { business: 'a'.repeat(3001) }]) {
      expect(InquirySchema.safeParse({ ...valid, ...change }).success).toBe(false)
    }
  })
  it('preserves every project detail in the established lead record', () => {
    const parsed = InquirySchema.parse({ ...valid, businessName: 'Clay Studio', website: '@claystudio', notes: 'Photography is ready.' })
    const lead = inquiryToDiscovery(parsed)
    expect(lead.serviceType).toBe('business')
    expect(lead.email).toBe(valid.email)
    expect(lead.budgetRange).toBe(valid.budgetRange)
    for (const value of ['Clay Studio', '@claystudio', ...valid.services, valid.business, valid.goals, valid.timeline, 'Photography is ready.']) {
      expect(lead.description).toContain(value)
    }
  })
})
