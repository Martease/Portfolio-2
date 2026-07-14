import Header from '../components/Header'
import DiscoveryForm from '../components/DiscoveryForm'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { CONTACT_EMAIL } from '../lib/contactConfig'

export default function ContactPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Contact"
          title="Lets discuss your next build"
          description="Share your goals, timeline, and current blockers. You will get a practical next-step response."
          align="left"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard>
            <h2 className="font-display text-2xl text-brand-ink">Discovery Form</h2>
            <div className="mt-5">
              <DiscoveryForm />
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="font-display text-2xl text-brand-ink">Direct Contact</h2>
            <div className="mt-4 space-y-4 text-brand-slate">
              <p>
                <span className="font-semibold text-brand-ink">Email:</span>{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-ember">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <span className="font-semibold text-brand-ink">LinkedIn:</span>{' '}
                <a href="https://linkedin.com/in/martease-martin-08663a338" target="_blank" rel="noreferrer" className="text-brand-ember">
                  martease-martin-08663a338
                </a>
              </p>
              <p>
                <span className="font-semibold text-brand-ink">GitHub:</span>{' '}
                <a href="https://github.com/Martease" target="_blank" rel="noreferrer" className="text-brand-ember">
                  github.com/Martease
                </a>
              </p>
              <div className="rounded-2xl bg-brand-sand p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-slate">Calendly</p>
                <p className="mt-2 text-sm">Scheduling integration planned for a future release.</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </main>
    </div>
  )
}