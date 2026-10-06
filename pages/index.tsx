import Header from '../components/Header'
import Reveal from '../components/ui/Reveal'
import SectionShell from '../components/ui/SectionShell'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { brandFoundation } from '../lib/brand'
import { featuredProjects } from '../lib/portfolioData'
import { currentFocusItems, processSteps } from '../lib/publicContent'
import Link from 'next/link'
import Head from 'next/head'

export default function Home() {
  const services = [
    {
      title: 'Web Design',
      description:
        'Visual direction, UX/UI layouts, responsive design, and brand integration crafted to establish credibility and guide visitors through your website.',
    },
    {
      title: 'Website Development',
      description:
        'Clean, responsive website builds using modern web technologies such as Next.js and React, with custom development when the project calls for it.',
    },
    {
      title: 'Custom Functionality',
      description:
        "Interactive features, tailored workflows, and platform integrations built when standard website features aren't enough.",
    },
    {
      title: 'Website Support',
      description:
        'Maintenance, content updates, performance improvements, and ongoing support to keep your website current and working as your business grows.',
    },
  ]

  return (
    <div className="text-brand-ink">
      <Head>
        <title>Martease Martin Design Dev | Web Designer &amp; Developer</title>
        <meta
          name="description"
          content="Martease Martin is a freelance web designer and developer creating thoughtful, modern business websites that communicate clearly and serve your customers."
        />
        <meta property="og:title" content="Martease Martin Design Dev | Web Designer & Developer" />
        <meta
          property="og:description"
          content="Thoughtful web design and development for businesses, led by Martease Martin."
        />
      </Head>
      <Header />
      <main id="home" className="pt-10 sm:pt-14">
        <SectionShell className="py-20 sm:py-24" containerClassName="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-brand-slate">{brandFoundation.companyName}</p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-ember">
                Web Designer &amp; Developer
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-6xl">
                Web Design &amp; Development Built Around Your Business.
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
                  View My Work
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={130}>
              <SurfaceCard className="bg-gradient-to-br from-brand-sand to-white p-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-slate">The approach</p>
                <p className="mt-3 text-lg font-semibold text-brand-ink">{brandFoundation.tagline}</p>
                <img
                  src="/assets/images/Background.png.jpeg"
                  alt="Illustration of a computer monitor displaying code"
                  className="hero-image-float mt-6 h-60 w-full rounded-2xl object-cover"
                />
              </SurfaceCard>
            </Reveal>
        </SectionShell>

        <SectionShell id="featured-projects">
            <Reveal>
              <SectionHeading
                eyebrow="Portfolio"
                title="Selected Work"
                description="A selection of projects shaped by clear design, thoughtful development, and the needs of the business."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <Reveal key={project.slug} delayMs={90 + index * 120}>
                  <SurfaceCard interactive>
                    <img src={project.heroImage} alt={project.title} className="h-48 w-full rounded-2xl object-cover" />
                    <h3 className="mt-5 font-display text-2xl text-brand-ink">{project.title}</h3>
                    <p className="mt-2 text-brand-slate">{project.overview}</p>
                    <p className="mt-3 text-sm text-brand-slate">{project.solution}</p>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
                      {project.techStack.map((technology) => (
                        <li key={technology} className="rounded-full bg-brand-sand px-3 py-1 text-xs text-brand-slate">
                          {technology}
                        </li>
                      ))}
                    </ul>
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
                title="Services"
                description="Thoughtful web design and development, shaped around what your business needs."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {services.map((service, index) => (
                <Reveal key={service.title} delayMs={90 + index * 100}>
                  <SurfaceCard className="h-full p-6">
                    <h3 className="font-display text-2xl text-brand-ink">{service.title}</h3>
                    <p className="mt-3 text-brand-slate">{service.description}</p>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
            <Reveal delayMs={180}>
              <div className="mt-8 text-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-brand-ember px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-emberDeep"
                >
                  Start a Project
                </Link>
              </div>
            </Reveal>
        </SectionShell>

        <SectionShell id="my-process">
            <Reveal>
              <SectionHeading
                title="A Clear Process"
                description="Each project moves from an initial conversation through launch and ongoing support."
              />
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <SectionShell id="about">
            <Reveal>
              <SurfaceCard className="grid gap-8 bg-brand-ink p-8 text-white lg:grid-cols-2">
                <div>
                  <img
                    src="/assets/images/IMG_0942.PNG"
                    alt="Portrait of Martease Martin"
                    className="mb-6 h-48 w-48 rounded-2xl object-cover"
                  />
                  <SectionHeading
                    eyebrow="About Martease"
                    title="Design, development, and an ownership mindset."
                    align="left"
                  />
                </div>
                <div className="space-y-4 text-slate-200">
                  <p>
                    Hi, I’m Martease Martin—a web designer and developer focused on building thoughtful digital experiences for businesses.
                  </p>
                  <p>
                    I approach every project with an ownership mindset shaped by real-world business operations, design, and software development. I combine thoughtful visual design with practical development to create websites that are clear, dependable, maintainable, and aligned with the goals of the business behind them.
                  </p>
                  <Link href="/about" className="inline-block pt-2 font-semibold text-orange-300">
                    Read Full Story
                  </Link>
                </div>
              </SurfaceCard>
            </Reveal>
        </SectionShell>

        <SectionShell id="current-focus">
            <Reveal>
              <SectionHeading
                title="Where I'm Building Next"
                description="My longer-term technical direction, alongside the website design and development work I do today."
              />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {currentFocusItems.map((item, index) => (
                <Reveal key={item.title} delayMs={95 + index * 110}>
                  <SurfaceCard className="bg-brand-sand">
                    <h3 className="font-display text-xl text-brand-ink">{item.title}</h3>
                    <p className="mt-3 text-brand-slate">{item.description}</p>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="contact" className="pb-24 pt-16" containerClassName="max-w-4xl">
            <Reveal>
              <SurfaceCard className="bg-gradient-to-r from-brand-ember to-brand-emberDeep p-8 text-white sm:p-10">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-orange-100">Have a project in mind?</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">Let’s build a website that works for your business.</h2>
                <p className="mt-3 max-w-2xl text-orange-100">
                  Share a little about your goals and what you need. We can start with a conversation and find the right next step.
                </p>
                <div className="mt-7">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-sand"
                  >
                    Start a Project
                  </Link>
                </div>
              </SurfaceCard>
            </Reveal>
        </SectionShell>
      </main>
    </div>
  )
}
