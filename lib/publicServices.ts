export type PublicService = {
  slug: string
  name: string
  problem: string
  solution: string
  deliverables: string[]
  benefits: string[]
}

export const publicServices: PublicService[] = [
  {
    slug: 'full-stack-delivery',
    name: 'Full-Stack Product Delivery',
    problem:
      'Teams need to ship quickly but struggle with fragmented frontend and backend ownership that causes delays and rework.',
    solution:
      'Build and deliver production-ready web applications with aligned architecture, API design, and user-facing quality from day one.',
    deliverables: [
      'Technical discovery and architecture map',
      'Responsive frontend implementation',
      'API and database integration',
      'Deployment and handoff documentation',
    ],
    benefits: [
      'Faster launch timeline',
      'Lower technical debt at handoff',
      'Consistent user and developer experience',
    ],
  },
  {
    slug: 'platform-modernization',
    name: 'Platform Modernization',
    problem:
      'Legacy interfaces and brittle codebases reduce trust, conversion, and team velocity as business needs evolve.',
    solution:
      'Modernize existing products with design-system upgrades, cleaner architecture, and focused performance improvements.',
    deliverables: [
      'UX and codebase audit',
      'Component library and design token refresh',
      'Critical flow refactors',
      'Performance and accessibility improvements',
    ],
    benefits: [
      'Improved conversion quality',
      'Better maintainability for internal teams',
      'Stronger brand credibility online',
    ],
  },
  {
    slug: 'growth-experiment-sprints',
    name: 'Growth Experiment Sprints',
    problem:
      'Founders often have strong hypotheses but no fast, structured implementation loop to validate what works.',
    solution:
      'Run short, measurable build sprints that launch focused experiments tied to real business outcomes.',
    deliverables: [
      'Sprint planning and success metrics',
      'Landing pages or feature experiments',
      'Analytics instrumentation',
      'Post-sprint insight report',
    ],
    benefits: [
      'Reduced guesswork',
      'Faster learning cycles',
      'Clear next-step decisions for product and marketing',
    ],
  },
]