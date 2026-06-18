export interface ServiceOffer {
  title: string
  description: string
  amount: number
  bg: string
  hireMeLabel: string
  includeInServices: boolean
  includeInHireMe: boolean
  platforms?: string // Added to show your expertise
}

export const serviceCatalog: ServiceOffer[] = [
  {
    title: 'Landing Pages',
    description: 'High-conversion, responsive pages.',
    amount: 59900, // Updated to ~$599
    bg: 'bg-orange-50',
    hireMeLabel: 'Landing Page',
    includeInServices: true,
    includeInHireMe: true,
    platforms: 'Custom / Wix / Squarespace',
  },
  {
    title: 'Multi-Page Sites',
    description: 'Professional brand websites.',
    amount: 129900, // Updated to ~$1,299
    bg: 'bg-orange-100',
    hireMeLabel: 'Website (Multi-Page)',
    includeInServices: true,
    includeInHireMe: true,
    platforms: 'Custom / WordPress',
  },
  {
    title: 'Email Templates',
    description: 'Professional, mobile-first designs.',
    amount: 19900, 
    bg: 'bg-orange-200',
    hireMeLabel: 'Email Templates',
    includeInServices: true,
    includeInHireMe: true,
    platforms: 'HTML/CSS / Mailchimp',
  },
  {
    title: 'Website Updates',
    description: 'Fast fixes and performance tweaks.',
    amount: 9900, // This works well as a base fee or per-hour-block
    bg: 'bg-orange-300',
    hireMeLabel: 'Website Updates',
    includeInServices: true,
    includeInHireMe: true,
    platforms: 'All Platforms',
  },
]

export const servicesForCards = serviceCatalog.filter((service) => service.includeInServices)

export const hireMeServiceOptions = serviceCatalog.filter((service) => service.includeInHireMe)

export const formatUsd = (amount: number) => `$${(amount / 100).toFixed(2)}`
