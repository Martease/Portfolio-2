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

// Validate service amounts are within acceptable ranges
const validateServiceAmounts = (services: ServiceOffer[]): void => {
  const MIN_AMOUNT = 100 // $1.00 in cents
  const MAX_AMOUNT = 50_000_000 // $500,000.00 in cents

  services.forEach((service) => {
    if (!Number.isInteger(service.amount) || service.amount < MIN_AMOUNT || service.amount > MAX_AMOUNT) {
      throw new Error(
        `Invalid service amount for "${service.title}": ${service.amount}. Must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} cents.`
      )
    }
  })
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

// Validate all service amounts at load time
validateServiceAmounts(serviceCatalog)

export const servicesForCards = serviceCatalog.filter((service) => service.includeInServices)

export const hireMeServiceOptions = serviceCatalog.filter((service) => service.includeInHireMe)

export const formatUsd = (amount: number) => `$${(amount / 100).toFixed(2)}`
