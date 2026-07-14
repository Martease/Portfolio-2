import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { formatUsd, servicesForCards } from '../lib/serviceCatalog'
import Link from 'next/link' // Import Link

export default function ServicesPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Services"
          title="Services and Pricing"
          description="Clear starting prices and delivery scopes. Select a service to start your discovery request."
          align="left"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {servicesForCards.map((service) => {
            const slug = service.title.toLowerCase().replace(/\s+/g, '-')
            
            return (
              <Link key={service.title} href={`/contact?service=${slug}`} className="group w-full">
                <SurfaceCard interactive className={`${service.bg} border-brand-cloud/60 h-full`}>
                  <h2 className="font-display text-2xl text-brand-ink">{service.title}</h2>
                  <p className="mt-3 text-brand-slate">{service.description}</p>
                  {service.platforms ? (
                    <p className="mt-3 text-sm font-semibold text-brand-slate">Platforms: {service.platforms}</p>
                  ) : null}
                  <p className="mt-4 text-lg font-semibold text-brand-ink">Starting at {formatUsd(service.amount)}</p>
                  <div className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-orange-100">
                    <span className="font-medium text-orange-900">Get Started</span>
                    <span className="text-orange-600">→</span>
                  </div>
                </SurfaceCard>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
