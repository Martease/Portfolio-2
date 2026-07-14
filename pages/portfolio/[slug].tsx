import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import Header from '../../components/Header'
import Pill from '../../components/ui/Pill'
import SectionHeading from '../../components/ui/SectionHeading'
import SurfaceCard from '../../components/ui/SurfaceCard'
import { getProjectBySlug, portfolioProjects } from '../../lib/portfolioData'

export default function PortfolioProjectPage({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <Link href="/portfolio" className="font-semibold text-brand-ember">
          Back to Portfolio
        </Link>

        <SectionHeading title={project.title} description={project.overview} align="left" />

        <img src={project.heroImage} alt={project.title} className="mt-8 h-[380px] w-full rounded-3xl object-cover" />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SurfaceCard>
            <h2 className="font-display text-2xl text-brand-ink">Problem</h2>
            <p className="mt-2 text-brand-slate">{project.problem}</p>
          </SurfaceCard>
          <SurfaceCard>
            <h2 className="font-display text-2xl text-brand-ink">Solution</h2>
            <p className="mt-2 text-brand-slate">{project.solution}</p>
          </SurfaceCard>
        </div>

        <SurfaceCard className="mt-6">
          <h2 className="font-display text-2xl text-brand-ink">Tech Stack</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.techStack.map((item) => (
              <Pill key={item}>{item}</Pill>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="mt-6">
          <h2 className="font-display text-2xl text-brand-ink">Screenshots</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {project.screenshots.map((image, index) => (
              <img key={`${project.slug}-${index}`} src={image} alt={`${project.title} screenshot ${index + 1}`} className="h-52 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="mt-6">
          <h2 className="font-display text-2xl text-brand-ink">Lessons Learned</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-brand-slate">
            {project.lessonsLearned.map((lesson) => (
              <li key={lesson}>{lesson}</li>
            ))}
          </ul>
        </SurfaceCard>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-brand-ember px-5 py-2.5 font-semibold text-white"
          >
            Live Demo
          </a>
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-brand-cloud px-5 py-2.5 font-semibold text-brand-ink"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: portfolioProjects.map((project) => ({ params: { slug: project.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{ project: (typeof portfolioProjects)[number] }> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const project = getProjectBySlug(slug)

  if (!project) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      project,
    },
  }
}