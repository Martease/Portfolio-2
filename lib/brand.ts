export type NavItem = {
  label: string
  href: string
  sectionId?: string
}

export const brandFoundation = {
  companyName: 'Martease Martin Design Dev',
  mission:
    'I design and build modern websites that help businesses establish credibility, communicate clearly, and create better experiences for their customers.',
  methodology: 'Discover -> Design -> Build -> Launch -> Support',
  vision: 'A thoughtful, independent web design and development practice led by Martease Martin.',
  tagline: 'Architecting Creative Stories.',
  logo: {
    markSrc: '/assets/images/IMG_0942.PNG',
    alt: 'Portrait of Martease Martin',
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
]