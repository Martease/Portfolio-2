import Header from '../components/Header'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'

const storyBlocks = [
  {
    title: 'Background',
    body: 'My professional foundation was built through hands-on work where quality, timing, and accountability had immediate real-world consequences.',
  },
  {
    title: 'Skilled Trades',
    body: 'Skilled trades taught me to diagnose problems quickly, execute with precision, and treat every deliverable as a reflection of personal standards.',
  },
  {
    title: 'Entrepreneurship',
    body: 'Running businesses sharpened my focus on outcomes, client communication, and the systems required to grow without sacrificing quality.',
  },
  {
    title: 'Software Engineering',
    body: 'I combine visual design and practical development to build thoughtful, clear, and dependable websites for businesses.',
  },
  {
    title: 'Philosophy',
    body: 'Useful software should feel clear to the user, stable for the team, and flexible enough to evolve as the business grows.',
  },
  {
    title: 'Mission', 
    body: 'Help businesses communicate clearly online through thoughtful websites and practical technical problem-solving.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen text-brand-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <SectionHeading
          eyebrow="About Martease"
          title="From hands-on work to thoughtful digital experiences"
          description="I’m Martease Martin, a web designer and developer who brings an ownership mindset to building clear, dependable websites for businesses."
          align="left"
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {storyBlocks.map((block) => (
            <SurfaceCard key={block.title}>
              <h2 className="font-display text-2xl text-brand-ink">{block.title}</h2>
              <p className="mt-3 text-brand-slate">{block.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </main>
    </div>
  )
}