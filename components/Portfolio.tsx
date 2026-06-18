const portfolioItems = [
  {
    title: 'Multi-Page Website',
    description: 'A polished multi-page portfolio site with responsive design.',
    href: 'https://handyservant.netlify.app/',
    imageName: 'Handy logo.PNG',
  },
  {
    title: 'Agency Landing Page',
    description: 'A modern landing page designed for creative agencies.',
    href: '#contact',
    imageName: 'Agency group.png',
  },
  {
    title: 'Website Refresh',
    description: 'A clean redesign to improve site performance and polish.',
    href: '#contact',
    imageName: 'Website update 2.png',
  },
]

const buildImageUrl = (name: string) => `/assets/images/${encodeURIComponent(name)}`

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-20 px-6 bg-orange-50">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-orange-900">Portfolio</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-orange-700">
          Recent work and examples of projects built with speed, polish, and strong architecture.
        </p>

        <div className="grid gap-6 mt-10 md:grid-cols-2 xl:grid-cols-3">
          {portfolioItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group block overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:bg-orange-100 hover:shadow-xl"
            >
              <div className="overflow-hidden h-56">
                <img
                  src={buildImageUrl(item.imageName)}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:opacity-90"
                />
              </div>
              <div className="p-6 transition duration-300 group-hover:bg-orange-200">
                <h3 className="text-2xl font-bold text-orange-900">{item.title}</h3>
                <p className="mt-3 text-orange-700">{item.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-orange-900 font-semibold transition duration-300 group-hover:bg-orange-200">
                  View Project →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio
