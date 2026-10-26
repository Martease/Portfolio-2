import { z } from 'zod'

export const inquiryServices = ['Website Design & Development', 'Website Redesign', 'E-commerce Website', 'Brand Identity & Creative Direction', 'Website Care & Maintenance', 'Something Else'] as const
export const inquiryBudgets = ['$750–$1,199', '$1,200–$1,999', '$2,000–$3,499', '$3,500–$5,000+', 'I’m not sure yet'] as const
export const inquiryTimelines = ['As soon as possible', 'Within 2–4 weeks', 'Within 1–2 months', 'Within 3+ months', 'I’m flexible'] as const
const requiredText = (label: string, max = 3000) => z.string().trim().min(1, `${label} is required.`).max(max, `Please use ${max} characters or fewer.`)
export const InquirySchema = z.object({
  inquiryVersion: z.literal(1),
  fullName: requiredText('Your name', 120),
  email: z.string().trim().email('Enter a valid email address.').max(200),
  businessName: z.string().trim().max(200).optional(),
  website: z.string().trim().max(500).optional(),
  services: z.array(z.enum(inquiryServices)).min(1, 'Choose at least one service.').max(6),
  business: requiredText('A little about your business'),
  goals: requiredText('Your project goals'),
  budgetRange: z.enum(inquiryBudgets, { error: 'Choose an estimated investment.' }),
  timeline: z.enum(inquiryTimelines, { error: 'Choose your ideal start time.' }),
  notes: z.string().trim().max(3000).optional(),
  serviceType: z.enum(['launch', 'business', 'scale', 'custom-project']),
})
export type InquiryData = z.infer<typeof InquirySchema>

// Keep the established lead fields and admin review pathway intact.
export function inquiryToDiscovery(data: InquiryData) {
  return {
    fullName: data.fullName, email: data.email, serviceType: data.serviceType,
    budgetRange: data.budgetRange, preferredPlatform: undefined,
    description: [
      `Business name: ${data.businessName || 'Not provided'}`,
      `Website / social: ${data.website || 'Not provided'}`,
      `Services: ${data.services.join(', ')}`,
      `Ideal start: ${data.timeline}`,
      '', 'About the business:', data.business,
      '', 'Project goals:', data.goals,
      '', 'Additional notes:', data.notes || 'None',
    ].join('\n'),
  }
}
