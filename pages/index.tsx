import Header from '../components/Header'
import Reveal from '../components/ui/Reveal'
import SectionShell from '../components/ui/SectionShell'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { brandFoundation } from '../lib/brand'
import { featuredProjects } from '../lib/portfolioData'
import { currentFocusItems, processSteps, testimonials } from '../lib/publicContent'
import Link from 'next/link'

export default function Home() {
  const corePackages = [
    {
      name: 'Launch',
      price: '$750',
      pages: '1-3 pages',
      description: 'For new businesses that need a professional online presence.',
      support: '14 days post-launch support',
    },
    {
      name: 'Business',
      featured: true,
      price: '$1,200',
      pages: '4-7 pages',
      description: 'For growing businesses that need a complete website built around their goals.',
      support: '30 days post-launch support',
    },
    {
      name: 'Scale',
      price: '$2,000+',
      pages: '8+ pages',
      description: 'For established businesses that need advanced functionality and a customized website.',
      support: '30 days post-launch support',
    },
  ]

  return (
    <div className="text-brand-ink">
      <Header />
      <main id="home" className="pt-10 sm:pt-14">
        <SectionShell className="py-20 sm:py-24" containerClassName="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-brand-slate">{brandFoundation.companyName}</p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-6xl">
                {brandFoundation.tagline}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-brand-slate">{brandFoundation.mission}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-brand-ember px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-ember/30 transition-colors hover:bg-brand-emberDeep"
                >
                  Start a Project
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-full border border-brand-cloud px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-ember hover:text-brand-ember"
                >
                  View Portfolio
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={130}>
              <SurfaceCard className="bg-gradient-to-br from-brand-sand to-white p-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-slate">Vision</p>
                <p className="mt-3 text-lg text-brand-ink">{brandFoundation.vision}</p>
                <img
                  src="/assets/images/Background.png.jpeg"
                  alt="Mamvo Labs showcase"
                  className="hero-image-float mt-6 h-60 w-full rounded-2xl object-cover"
                />
              </SurfaceCard>
            </Reveal>
        </SectionShell>

        <SectionShell id="featured-projects">
            <Reveal>
              <SectionHeading
                eyebrow="Homepage"
                title="Featured Projects"
                description="Selected builds focused on measurable business outcomes and long-term technical quality."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <Reveal key={project.slug} delayMs={90 + index * 120}>
                  <SurfaceCard interactive>
                    <img src={project.heroImage} alt={project.title} className="h-48 w-full rounded-2xl object-cover" />
                    <h3 className="mt-5 font-display text-2xl text-brand-ink">{project.title}</h3>
                    <p className="mt-2 text-brand-slate">{project.overview}</p>
                    <Link href={`/portfolio/${project.slug}`} className="mt-5 inline-block font-semibold text-brand-ember">
                      Read Case Study
                    </Link>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="services">
            <Reveal>
              <SectionHeading
                title="3 Core Packages"
                description="Simple tiers built for launch, growth, and scale so you can choose the right fit quickly."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {corePackages.map((pkg, index) => (
                <Reveal key={pkg.name} delayMs={110 + index * 120}>
                  <Link href={`/contact?package=${pkg.name.toLowerCase()}`} className="group block h-full">
                    <SurfaceCard
                      interactive
                      className={`h-full border p-6 ${pkg.featured ? 'border-brand-ember bg-brand-sand' : 'border-brand-cloud/70 bg-white'}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">
                        {pkg.name}
                        {pkg.featured ? ' ⭐' : ''}
                      </p>
                      <h3 className="mt-2 font-display text-3xl text-brand-ink">{pkg.price}</h3>
                      <p className="mt-3 text-sm font-semibold text-brand-slate">{pkg.pages}</p>
                      <p className="mt-3 text-brand-slate">{pkg.description}</p>
                      <p className="mt-4 text-sm font-medium text-brand-slate">{pkg.support}</p>
                      <div className="mt-6 inline-flex w-full items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-brand-sand">
                        <span className="font-medium text-brand-ink">Choose Package</span>
                        <span className="text-brand-ember">→</span>
                      </div>
                    </SurfaceCard>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal delayMs={220}>
              <div className="mt-8 text-center">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full border border-brand-cloud px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-ember hover:text-brand-ember"
                >
                  Explore All Service Details
                </Link>
              </div>
            </Reveal>
        </SectionShell>

        <SectionShell id="about">
            <Reveal>
              <SurfaceCard className="grid gap-8 bg-brand-ink p-8 text-white lg:grid-cols-2">
                <div>
                  <SectionHeading
                    eyebrow="About"
                    title="Built from skilled trades, entrepreneurship, and software engineering discipline."
                    description="The same ownership mindset used on job sites and in business operations now drives how every software engagement is planned and delivered."
                    align="left"
                  />
                </div>
                <div className="space-y-4 text-slate-200">
                  <p>
                    Mamvo Labs combines field-tested execution habits with modern engineering craft, resulting in software that is both dependable and outcome-focused.
                  </p>
                  <p>
                    We prioritize clear communication, practical architecture, and measurable value over unnecessary complexity.
                  </p>
                  <Link href="/about" className="inline-block pt-2 font-semibold text-orange-300">
                    Read the full story
                  </Link>
                </div>
              </SurfaceCard>
            </Reveal>
        </SectionShell>

        <SectionShell id="my-process">
            <Reveal>
              <SectionHeading title="My Process" description="A straightforward framework that keeps quality high while keeping momentum strong." />
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {processSteps.map((step, index) => (
                <Reveal key={step.title} delayMs={90 + index * 100}>
                  <SurfaceCard className="h-full">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-slate">Step {index + 1}</p>
                    <h3 className="mt-3 font-display text-xl text-brand-ink">{step.title}</h3>
                    <p className="mt-2 text-brand-slate">{step.detail}</p>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="current-focus">
            <Reveal>
              <SectionHeading title="Current Focus" description="Where Bycra is investing build energy right now." />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {currentFocusItems.map((item, index) => (
                <Reveal key={item} delayMs={95 + index * 110}>
                  <SurfaceCard className="bg-brand-sand">
                    <p className="text-brand-ink">{item}</p>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="testimonials">
            <Reveal>
              <SectionHeading title="Testimonials" description="Feedback from teams and founders who needed outcomes, not just output." />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.person} delayMs={110 + index * 110}>
                  <SurfaceCard className="bg-white">
                    <p className="text-brand-slate">"{testimonial.quote}"</p>
                    <p className="mt-4 font-semibold text-brand-ink">{testimonial.person}</p>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="contact" className="pb-24 pt-16" containerClassName="max-w-4xl">
            <Reveal>
              <SurfaceCard className="bg-gradient-to-r from-brand-ember to-brand-emberDeep p-8 text-white sm:p-10">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-orange-100">Contact CTA</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">Ready to build your next release with confidence?</h2>
                <p className="mt-3 max-w-2xl text-orange-100">
                  Tell me what you are building, where you are blocked, and what success should look like. We can map an execution plan quickly.
                </p>
                <div className="mt-7">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-sand"
                  >
                    Contact Bycra
                  </Link>
                </div>
              </SurfaceCard>
            </Reveal>
        </SectionShell>
      </main>
    </div>
  )
}
