import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import Link from 'next/link' // Import Link

export default function ServicesPage() {
  const plans = [
    {
      name: 'Launch',
      price: '$750',
      bestFor: 'New businesses getting online',
      pages: '1-3',
      cms: '-',
      blog: '-',
      advancedFunctionality: '-',
      ecommerce: '-',
      customIntegrations: '-',
      postLaunchSupport: '14 days',
      description: 'For new businesses that need a professional online presence.',
      details: [
        '1-3 pages',
        'Custom website design',
        'Responsive design',
        'Contact form',
        'Basic SEO',
        'Analytics',
        '14 days post-launch support',
      ],
    },
    {
      name: 'Business',
      featured: true,
      price: '$1,200',
      bestFor: 'Growing businesses',
      pages: '4-7',
      cms: 'Yes',
      blog: 'Yes',
      advancedFunctionality: '-',
      ecommerce: '-',
      customIntegrations: '-',
      postLaunchSupport: '30 days',
      description: 'For growing businesses that need a complete website built around their goals.',
      details: [
        '4-7 pages',
        'Custom website design',
        'Responsive design',
        'CMS',
        'Contact forms',
        'Blog / News',
        'Basic SEO',
        'Analytics',
        '30 days post-launch support',
      ],
    },
    {
      name: 'Scale',
      price: '$2,000+',
      bestFor: 'Established businesses',
      pages: '8+',
      cms: 'Yes',
      blog: 'Yes',
      advancedFunctionality: 'Yes',
      ecommerce: 'Yes',
      customIntegrations: 'Yes',
      postLaunchSupport: '30 days',
      description: 'For established businesses that need advanced functionality and a more customized website.',
      details: [
        '8+ pages',
        'Custom website design',
        'Responsive design',
        'CMS',
        'Advanced functionality',
        'E-commerce',
        'Custom integrations',
        'Basic SEO',
        'Analytics',
        '30 days post-launch support',
      ],
    },
  ]

  const matrixRows = [
    { label: 'Best for', values: plans.map((plan) => plan.bestFor) },
    { label: 'Pages', values: plans.map((plan) => plan.pages) },
    { label: 'Custom website design', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'Responsive design', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'Contact forms', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'Basic SEO', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'Analytics setup', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'CMS', values: plans.map((plan) => plan.cms) },
    { label: 'Blog / News', values: plans.map((plan) => plan.blog) },
    { label: 'Advanced functionality', values: plans.map((plan) => plan.advancedFunctionality) },
    { label: 'E-commerce', values: plans.map((plan) => plan.ecommerce) },
    { label: 'Custom integrations', values: plans.map((plan) => plan.customIntegrations) },
    { label: 'Post-launch support', values: plans.map((plan) => plan.postLaunchSupport) },
  ]

  const displayCell = (value: string) => {
    if (value === 'Yes') {
      return '✓'
    }

    return value
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Services"
          title="Pricing"
          description="Choose a package designed for your current stage, from launch to growth to advanced scale."
          align="left"
        />

        <div className="mt-10 overflow-x-auto rounded-3xl border border-brand-cloud bg-white shadow-md">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-brand-sand text-brand-ink">
                <th className="px-5 py-4 text-sm font-semibold uppercase tracking-wide">Package</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="px-5 py-4 text-sm font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      {plan.name}
                      {plan.featured ? '⭐' : ''}
                    </span>
                  </th>
                ))}
              </tr>
              <tr className="border-t border-brand-cloud bg-brand-sand/50 text-brand-ink">
                <th className="px-5 py-4 text-base font-semibold">Price</th>
                {plans.map((plan) => (
                  <th key={`${plan.name}-price`} className="px-5 py-4 text-2xl font-bold">
                    {plan.price}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row.label} className="border-t border-brand-cloud/60">
                  <td className="px-5 py-4 font-semibold text-brand-ink">{row.label}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${plans[index].name}`} className="px-5 py-4 text-brand-slate">
                      {displayCell(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const slug = plan.name.toLowerCase()

            return (
              <Link key={plan.name} href={`/contact?package=${slug}`} className="group block">
                <SurfaceCard
                  interactive
                  className={`h-full border p-6 ${
                    plan.featured ? 'border-brand-ember bg-brand-sand' : 'border-brand-cloud/70 bg-white'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">{plan.name}</p>
                  <h2 className="mt-2 font-display text-3xl text-brand-ink">{plan.price}</h2>
                  <p className="mt-4 text-brand-slate">{plan.description}</p>
                  <ul className="mt-6 space-y-2 text-sm text-brand-slate">
                    {plan.details.map((detail) => (
                      <li key={`${plan.name}-${detail}`} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-ember">-</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 inline-flex w-full items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-brand-sand">
                    <span className="font-medium text-brand-ink">Get Started</span>
                    <span className="text-brand-ember">→</span>
                  </div>
                </SurfaceCard>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-brand-cloud bg-brand-sand p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">Custom Projects</p>
          <h3 className="mt-3 font-display text-3xl text-brand-ink">
            Need something that does not fit one of our packages?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-brand-slate">
            Every business is different. Let&apos;s build a website around your specific goals, requirements, and budget.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-ember px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-emberDeep"
          >
            Let&apos;s Talk →
          </Link>
        </div>
      </main>
    </div>
  )
}
