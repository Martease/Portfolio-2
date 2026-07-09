export type PortfolioProject = {
  slug: string
  title: string
  heroImage: string
  overview: string
  problem: string
  solution: string
  techStack: string[]
  screenshots: string[]
  liveDemo: string
  github: string
  lessonsLearned: string[]
  featured?: boolean
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'handyservant-platform',
    title: 'HandyServant Service Platform',
    heroImage: '/assets/images/Handy%20logo.PNG',
    overview:
      'A conversion-focused service platform for home-service customers, built to showcase offerings, capture qualified leads, and simplify trust-building.',
    problem:
      'The business had traffic but low lead conversion due to unclear service hierarchy, weak call-to-action placement, and inconsistent mobile experience.',
    solution:
      'Designed a responsive multi-page experience with clear service segmentation, polished proof elements, and concise lead-capture pathways.',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    screenshots: [
      '/assets/images/Handy%20logo.PNG',
      '/assets/images/Website%20update%202.png',
    ],
    liveDemo: 'https://handyservant.netlify.app/',
    github: 'https://github.com/Martease',
    lessonsLearned: [
      'Service businesses convert better when each offer has a dedicated value narrative.',
      'Mobile-first spacing and hierarchy decisions can significantly increase form completion rates.',
      'Clear before-and-after messaging outperforms feature-heavy content for local service brands.',
    ],
    featured: true,
  },
  {
    slug: 'averting-agency-landing',
    title: 'Averting Agency Landing Experience',
    heroImage: '/assets/images/Agency%20group.png',
    overview:
      'A modern agency landing page focused on credibility, service clarity, and direct inquiry conversions.',
    problem:
      'The original concept lacked a compelling narrative flow and failed to communicate differentiation quickly to first-time visitors.',
    solution:
      'Created a crisp, modular landing flow that pairs outcome-oriented copy with visual rhythm and strategically placed conversion prompts.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Netlify'],
    screenshots: ['/assets/images/Agency%20group.png'],
    liveDemo: 'https://avertinglanding.netlify.app/',
    github: 'https://github.com/Martease',
    lessonsLearned: [
      'Short, confident copy paired with proof points performs better than dense explanations.',
      'Card-based service presentation improves scanning behavior on smaller screens.',
      'Landing pages benefit from one primary action repeated intentionally across sections.',
    ],
    featured: true,
  },
  {
    slug: 'mamvo-website-refresh',
    title: 'Mamvo Website Refresh',
    heroImage: '/assets/images/Website%20update%202.png',
    overview:
      'A complete refresh of the public-facing Mamvo Labs web experience to align brand, messaging, and service positioning.',
    problem:
      'The prior site blended portfolio, operations, and admin context, making it hard for prospects to understand the offer quickly.',
    solution:
      'Introduced a clean public information architecture, stronger messaging hierarchy, and reusable UI system for consistent growth.',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    screenshots: ['/assets/images/Website%20update%202.png'],
    liveDemo: 'https://mamvo-labs.com',
    github: 'https://github.com/Martease/Portfolio-2',
    lessonsLearned: [
      'Separating public marketing from operations views improves both user trust and maintainability.',
      'A documented design language makes page expansion faster and more consistent.',
      'Reusable content models reduce repeated copy edits and improve iteration speed.',
    ],
  },
]

export const featuredProjects = portfolioProjects.filter((project) => project.featured)

export const getProjectBySlug = (slug: string) =>
  portfolioProjects.find((project) => project.slug === slug)