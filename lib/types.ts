import { z } from 'zod'

export const DiscoveryFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  serviceType: z.enum(['launch', 'business', 'scale', 'custom-project']),
  description: z.string().min(20, 'Project description must be at least 20 characters.'),
  preferredPlatform: z.string().optional(),
  budgetRange: z.string().min(1, 'Budget range is required.'),
})

export type DiscoveryFormData = z.infer<typeof DiscoveryFormSchema>