export type NavItem = {
  label: string
  href: string
  sectionId?: string
}

export const brandFoundation = {
  companyName: 'Mamvo Labs',
  mission:
    'Build practical, high-performance software that helps ambitious teams move from idea to execution with confidence.',
  vision:
    'Become the trusted engineering partner for growth-stage founders and operators who need reliable systems that scale.',
  tagline: 'Precision-built software for serious growth.',
  logo: {
    markSrc: '/assets/images/IMG_0942.PNG',
    alt: 'Mamvo Labs logo',
    placement: ['header-left', 'favicon'],
  },
  palette: {
    ink: '#0f172a',
    slate: '#334155',
    sand: '#f8fafc',
    cloud: '#e2e8f0',
    ember: '#ea580c',
    emberDeep: '#9a3412',
  },
  typography: {
    display: 'Space Grotesk',
    body: 'Manrope',
    accent: 'IBM Plex Mono',
  },
}

export const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/#home', sectionId: 'home' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
  { label: 'Client Login', href: '/login' },
]