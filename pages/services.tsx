import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { publicServices } from '../lib/publicServices'

export default function ServicesPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Services"
          title="Practical solutions for real delivery pressure"
          description="Each service model is structured around the same four essentials: problem, solution, deliverables, and business benefits."
          align="left"
        />

        <div className="mt-10 grid gap-6">
          {publicServices.map((service) => (
            <SurfaceCard key={service.slug} className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl text-brand-ink">{service.name}</h2>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.1em] text-brand-slate">Problem</p>
                <p className="mt-1 text-brand-slate">{service.problem}</p>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.1em] text-brand-slate">Solution</p>
                <p className="mt-1 text-brand-slate">{service.solution}</p>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-slate">Deliverables</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-slate">
                  {service.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>

                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.1em] text-brand-slate">Benefits</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-slate">
                  {service.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </main>
    </div>
  )
}