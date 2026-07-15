export type NavItem = {
  label: string
  href: string
  sectionId?: string
}

export const brandFoundation = {
  companyName: 'Bycra',
  mission: 'We transform ideas into meaningful digital experiences through thoughtful design, modern technology, and intentional craftsmanship.',
  methodology:'How do we accomplish our mission? Learn -> Build -> Create -> Share',
  vision:  'Inspiring others to creativly tell their story.',
  tagline: 'Architecting Creative Stories.',
  logo: {
    markSrc: '/assets/images/IMG_0942.PNG',
    alt: 'Bycra logo',
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