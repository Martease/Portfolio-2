export default function Services() {
  const items = [
    {
      title: 'Landing Pages',
      description: 'Responsive landing pages built for conversions.',
      href: '#contact',
      bg: 'bg-orange-50',
    },
    {
      title: 'Multi-Page Sites',
      description: 'Brand websites with multiple sections and smooth flow.',
      href: '#contact',
      bg: 'bg-orange-100',
    },
    {
      title: 'Email Templates',
      description: 'Email campaigns with professional, mobile-first designs.',
      href: '#contact',
      bg: 'bg-orange-200',
    },
    {
      title: 'Website Updates',
      description: 'Fast site updates, bug fixes, and performance improvements.',
      href: '#contact',
      bg: 'bg-orange-300',
    },
  ];

  return (
    <section id="services" className="py-20 px-6 bg-orange-50">

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">
          Services
        </h2>

        <div className="flex flex-col gap-4 mt-10">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={`${item.bg} group block rounded-3xl border border-orange-200 p-5 sm:p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-orange-900">{item.title}</h3>
                  <p className="mt-3 text-orange-700">{item.description}</p>
                </div>
                <div className="inline-flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-orange-100">
                  <span className="font-medium text-orange-900">Purchase</span>
                  <span className="text-orange-600">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}