export default function Services() {
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
      description:
        'For new businesses that need a professional online presence.',
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
      description:
        'For growing businesses that need a complete website built around their goals.',
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
      description:
        'For established businesses that need advanced functionality and a more customized website.',
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
  ];

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
    {
      label: 'Advanced functionality',
      values: plans.map((plan) => plan.advancedFunctionality),
    },
    { label: 'E-commerce', values: plans.map((plan) => plan.ecommerce) },
    {
      label: 'Custom integrations',
      values: plans.map((plan) => plan.customIntegrations),
    },
    {
      label: 'Post-launch support',
      values: plans.map((plan) => plan.postLaunchSupport),
    },
  ];

  const displayCell = (value: string) => {
    if (value === 'Yes') {
      return '✓';
    }

    return value;
  };

  return (
    <section id="services" className="py-20 px-6 bg-orange-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-orange-900">Pricing</h2>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-orange-200 bg-white shadow-md">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-orange-100 text-orange-900">
                <th className="px-5 py-4 text-sm font-semibold uppercase tracking-wide">
                  Package
                </th>
                {plans.map((plan) => (
                  <th key={plan.name} className="px-5 py-4 text-sm font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      {plan.name}
                      {plan.featured ? '⭐' : ''}
                    </span>
                  </th>
                ))}
              </tr>
              <tr className="border-t border-orange-200 bg-orange-50 text-orange-900">
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
                <tr key={row.label} className="border-t border-orange-100">
                  <td className="px-5 py-4 font-semibold text-orange-900">{row.label}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${plans[index].name}`} className="px-5 py-4 text-orange-800">
                      {displayCell(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-md ${
                plan.featured
                  ? 'border-orange-400 bg-orange-100'
                  : 'border-orange-200 bg-white'
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                {plan.name}
              </p>
              <p className="mt-3 text-3xl font-bold text-orange-900">{plan.price}</p>
              <p className="mt-4 text-orange-700">{plan.description}</p>

              <ul className="mt-6 space-y-2 text-sm text-orange-800">
                {plan.details.map((detail) => (
                  <li key={`${plan.name}-${detail}`} className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-600">-</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-orange-200 bg-orange-100 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
            Custom Projects
          </p>
          <h3 className="mt-3 text-2xl font-bold text-orange-900">
            Need something that does not fit one of our packages?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-orange-700">
            Every business is different. Let us build a website around your specific goals, requirements, and budget.
          </p>
          <a
            href="#contact"
            className="mt-6 inline-flex rounded-full bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
          >
            Let&apos;s Talk -&gt;
          </a>
        </div>
      </div>
    </section>
  );
}
