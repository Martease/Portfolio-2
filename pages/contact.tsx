import Head from 'next/head'
import Link from 'next/link'
import PublicMetadata from '../components/PublicMetadata'
import Header from '../components/Header'
import DiscoveryForm from '../components/DiscoveryForm'
import styles from '../styles/Inquiry.module.css'

const steps = [
  ['Share Your Vision', 'Tell us about your business, your ideas, and what you hope to accomplish.'],
  ['Let’s Connect', 'We’ll review your inquiry and, if the project looks like a good fit, invite you to a complimentary discovery call.'],
  ['Your Custom Proposal', 'After discussing your goals and project requirements, we’ll prepare a proposal outlining the recommended approach, scope, and investment.'],
]
export default function ContactPage() {
  return <div className={styles.page}>
    <PublicMetadata title="Contact Bycra | Let’s Work Together" description="Great things begin with a conversation. Tell Bycra about your business and begin a personalized web design and development experience with Martease Martin." />
    <Head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" /></Head>
    <Header />
    <main id="main-content">
      <section className={`${styles.section} ${styles.hero}`} aria-labelledby="inquiry-title">
        <div className={styles.topline}><p className={styles.eyebrow}>Let’s work together</p><span className={styles.studioNote}>Independent studio. Personal by design.</span></div>
        <h1 id="inquiry-title">Great Things Begin<br />With a <span>Conversation.</span></h1>
        <div className={styles.heroBottom}><p className={styles.statement}>Thoughtful design.<br />Clear communication.<br />A creative experience<br />built around you.</p><div className={styles.intro}><p>Every business has a story, and we’d love to hear yours.</p><p>Whether you’re launching something new, refreshing your digital presence, or exploring what’s possible, we’re here to help bring your ideas to life.</p><p>Tell us a little about your business and what you’re dreaming up. We’ll take it from there.</p><a href="#inquiry" className={styles.textLink}>Start the conversation <span aria-hidden="true">↓</span></a></div></div>
      </section>
      <section id="inquiry" className={`${styles.section} ${styles.inquiry}`} aria-labelledby="form-title">
        <aside className={styles.formIntro}><p className={styles.eyebrow}>Your next chapter</p><h2 id="form-title">A little about you.<br /><span>A world of possibilities.</span></h2><p>You bring the vision. We’ll help find the direction.</p><div className={styles.studioStamp} aria-hidden="true">B<span>Bycra / Creative partnerships</span></div></aside>
        <DiscoveryForm />
      </section>
      <section className={`${styles.section} ${styles.next}`} aria-labelledby="next-title"><p className={styles.eyebrow}>What happens next?</p><h2 id="next-title">A Simple Beginning<br />to Something Great.</h2><div className={styles.steps}>{steps.map(([title, copy], i) => <article className={styles.step} key={title}><span className={styles.number}>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className={`${styles.section} ${styles.personal}`} aria-labelledby="personal-title"><div><p className={styles.eyebrow}>A personal approach</p><p className={styles.signature}>Martease Martin<span>Designer, developer & the person behind Bycra</span></p></div><div><h2 id="personal-title">You’ll Work With a Real Person Who Cares About Your Project.</h2><p>Behind Bycra is a designer who believes that great work starts with genuine conversations, thoughtful collaboration, and understanding the people behind each business.</p><p>You’ll receive personalized attention throughout the creative process, with clear communication and guidance from beginning to launch.</p></div></section>
      <section className={`${styles.section} ${styles.investment}`} aria-labelledby="investment-title"><div><p className={styles.eyebrow}>Before we begin</p><h2 id="investment-title">Curious About<br />the Investment?</h2></div><div><p>Every project is different, but understanding your options is an important first step.</p><p>Explore our services, starting investments, and creative process to get a better idea of what working with Bycra could look like.</p><Link className={styles.textLink} href="/services">Explore Services & Pricing <span aria-hidden="true">→</span></Link></div></section>
    </main>
    <footer className={styles.footer}><Link href="/" aria-label="Bycra homepage">Bycra</Link><p>Thoughtfully designed. Built together.</p><Link href="/services">Explore Services <span aria-hidden="true">↗</span></Link></footer>
  </div>
}
