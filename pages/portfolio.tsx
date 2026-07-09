import Link from 'next/link'
import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { portfolioProjects } from '../lib/portfolioData'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="Portfolio"
          title="Project case studies"
          description="Each project includes context, technical choices, and outcomes to show how strategy translates into shipped software."
          align="left"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolioProjects.map((project) => (
            <SurfaceCard key={project.slug} interactive>
              <img src={project.heroImage} alt={project.title} className="h-52 w-full rounded-2xl object-cover" />
              <h2 className="mt-4 font-display text-2xl text-brand-ink">{project.title}</h2>
              <p className="mt-2 text-brand-slate">{project.overview}</p>
              <Link href={`/portfolio/${project.slug}`} className="mt-5 inline-block font-semibold text-brand-ember">
                Open Project
              </Link>
            </SurfaceCard>
          ))}
        </div>
      </main>
    </div>
  )
}