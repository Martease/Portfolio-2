import About from '../components/About'
import Accomplishments from '../components/Accomplishments'
import Contact from '../components/Contact'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Portfolio from '../components/Portfolio'
import Services from '../components/Services'

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <Header />
      <main className="pt-24">
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Accomplishments />
        <Contact />
      </main>
    </div>
  )
}
