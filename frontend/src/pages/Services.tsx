export default function Services() {
  const items = [
    {
      title: 'Landing Pages',
      price: '500',
      description: 'Responsive, high-conversion landing pages.',
      platforms: 'Custom Code / Wix / Squarespace',
      bg: 'bg-orange-50',
    },
    {
      title: 'Multi-Page Sites',
      price: '1,200',
      description: 'Full brand websites with smooth navigation.',
      platforms: 'Custom Code / WordPress / Webflow',
      bg: 'bg-orange-100',
    },
    {
      title: 'Email Templates',
      price: '150',
      description: 'Mobile-first designs for marketing campaigns.',
      platforms: 'HTML/CSS / Mailchimp',
      bg: 'bg-orange-200',
    },
    {
      title: 'Website Updates',
      price: '75/hr',
      description: 'Fast bug fixes, content changes, and maintenance.',
      platforms: 'All Platforms',
      bg: 'bg-orange-300',
    },
  ];

  return (
    <section id="services" className="py-20 px-6 bg-orange-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Services & Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {items.map((item) => (
            <div
              key={item.title}
              className={`${item.bg} group flex flex-col justify-between rounded-3xl border border-orange-200 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div>
                <h3 className="text-2xl font-bold text-orange-900">{item.title}</h3>
                <p className="mt-2 text-orange-700">{item.description}</p>
                <p className="mt-2 text-sm font-semibold text-orange-800 italic">
                  Expertise: {item.platforms}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xl font-bold text-orange-900">
                  {item.price.includes('/') ? `$${item.price}` : `Starts at $${item.price}`}
                </span>
                <a 
                  href="#contact" 
                  className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-700 transition"
                >
                  Get a Quote
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
