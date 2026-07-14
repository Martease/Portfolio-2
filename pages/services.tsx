import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { formatUsd, servicesForCards } from '../lib/serviceCatalog'

export default function ServicesPage() {
  const handlePurchase = async (service: (typeof servicesForCards)[number]) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service.title,
          amount: service.amount,
        }),
      })

      const data = await response.json().catch(() => ({} as { message?: string; url?: string }))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session')
      }

      if (!data.url) {
        throw new Error('Checkout session did not return a redirect URL.')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      const message = error instanceof Error ? error.message : 'Failed to initiate checkout. Please try again.'
      alert(message)
    }
  }

  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Services"
          title="Services and Pricing"
          description="Clear starting prices and delivery scopes to help you choose the best engagement model quickly."
          align="left"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {servicesForCards.map((service) => (
            <button key={service.title} onClick={() => handlePurchase(service)} className="group w-full text-left">
              <SurfaceCard interactive className={`${service.bg} border-brand-cloud/60`}>
                <h2 className="font-display text-2xl text-brand-ink">{service.title}</h2>
                <p className="mt-3 text-brand-slate">{service.description}</p>
                {service.platforms ? (
                  <p className="mt-3 text-sm font-semibold text-brand-slate">Platforms: {service.platforms}</p>
                ) : null}
                <p className="mt-4 text-lg font-semibold text-brand-ink">Starting at {formatUsd(service.amount)}</p>
                <div className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-orange-100">
                  <span className="font-medium text-orange-900">Purchase</span>
                  <span className="text-orange-600">→</span>
                </div>
              </SurfaceCard>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}