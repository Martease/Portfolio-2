import PublicMetadata from '../components/PublicMetadata'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { featuredProjects } from '../lib/portfolioData'
import styles from '../styles/Services.module.css'

const pillars = [
  [
    'Personalized Attention',
    'No two businesses are alike. We take the time to understand your business, your audience, and your goals before exploring creative solutions.',
  ],
  [
    'Clear Communication',
    'You should never feel left in the dark. We prioritize transparency, meaningful updates, and open conversations throughout your project.',
  ],
  [
    'Thoughtful Collaboration',
    'Your ideas matter. We combine your knowledge of your business with our creative and technical expertise to build something meaningful together.',
  ],
  [
    'An Organized Process',
    'Creative work should feel exciting, not overwhelming. Our structured workflow helps keep your project focused, organized, and moving forward.',
  ],
]
const services = [
  {
    label: 'Website Design & Development',
    title: 'Your Business. Beautifully Represented.',
    paragraphs: [
      'Your website is often the first meaningful interaction someone has with your business.',
      'We create thoughtfully designed, responsive websites that communicate your brand, connect with your audience, and make it easy for visitors to take the next step.',
      'Every project balances visual creativity with practical functionality.',
    ],
    inclusions: [
      'Website strategy and planning',
      'Custom website design',
      'Responsive development',
      'User experience considerations',
      'Content organization',
      'Basic on-page SEO foundations',
      'Website testing and launch preparation',
    ],
    cta: 'Explore Website Design',
    visual: ['Your story,', 'beautifully structured.'],
    caption: '01 / Clarity meets creativity',
  },
  {
    label: 'E-commerce Design',
    title: 'A Better Way to Showcase What You Sell.',
    paragraphs: [
      'Your online store should feel like a natural extension of your brand.',
      'We design engaging e-commerce experiences that help customers discover your products, navigate your collections, and shop with confidence.',
      'From product presentation to the purchasing experience, every detail should support your business and your customers.',
    ],
    inclusions: [
      'Online store design',
      'Product and collection layouts',
      'Shopping experience considerations',
      'Payment integration',
      'Store configuration',
      'Mobile shopping layouts',
      'Launch preparation',
    ],
    cta: 'Let’s Build Your Store',
    visual: ['Discover.', 'Connect. Shop.'],
    caption: '02 / A considered customer journey',
  },
  {
    label: 'Brand Identity & Creative Direction',
    title: 'Give Your Business a Distinctive Identity.',
    paragraphs: [
      'A memorable brand begins with clarity and consistency.',
      'We help businesses explore a cohesive visual direction through carefully selected colors, typography, and supporting brand elements.',
      'The goal is an identity that feels authentic to your business and works consistently across your digital presence.',
    ],
    inclusions: [
      'Visual identity consultation',
      'Color palette development',
      'Typography selection',
      'Supporting brand assets',
      'Digital brand guidelines',
      'Creative direction',
    ],
    cta: 'Explore Brand Identity',
    visual: ['A distinct', 'point of view.'],
    caption: '03 / Color, type & intention',
    review:
      'Scope to review together: standalone brand identity services and the items below are proposed areas of work, subject to confirmation during discovery.',
  },
  {
    label: 'Website Care & Support',
    title: 'Your Website Doesn’t Stop at Launch.',
    paragraphs: [
      'Launching your website is an exciting milestone, but maintaining a strong digital presence requires ongoing attention.',
      'Bycra offers website care and support to help keep your website updated, functional, and aligned with your evolving business needs.',
    ],
    inclusions: [
      'Content updates',
      'Website maintenance',
      'Minor design adjustments',
      'Troubleshooting',
      'Basic SEO updates',
      'Ongoing support',
    ],
    cta: 'Explore Website Care',
    visual: ['Built to launch.', 'Cared for after.'],
    caption: '04 / Room to keep growing',
  },
]
const process = [
  [
    'Discover',
    'We start with a conversation about your business, audience, challenges, and vision. This helps us establish a clear direction before any design work begins.',
  ],
  [
    'Strategize',
    'We organize your goals, explore creative direction, and develop a plan that aligns your website with your business objectives.',
  ],
  [
    'Design',
    'Your vision starts taking shape through thoughtful layouts, typography, colors, and user experiences. You’ll have opportunities to review the direction and provide feedback.',
  ],
  [
    'Develop',
    'Once the design direction is approved, we transform it into a functional, responsive website. We focus on usability, performance, and consistency across devices.',
  ],
  [
    'Launch',
    'After testing and final refinements, we prepare your website for launch. We provide guidance to help you move forward with confidence.',
  ],
]
const faqs = [
  [
    'How does the website design process work?',
    'We begin with discovery, agree on a strategy, and move through design, development, and launch. You’ll know what is happening and where your feedback fits before each stage begins.',
  ],
  [
    'How long does a typical website project take?',
    'Timing depends on the scope, functionality, content readiness, and feedback. We discuss a realistic schedule during discovery and confirm it in your proposal before work begins.',
  ],
  [
    'What do I need before getting started?',
    'Bring your business goals, any existing website or brand materials, and a sense of what you need. We’ll help identify the content, access, and other materials your particular project requires.',
  ],
  [
    'Will I be involved in the design process?',
    'Absolutely. Your knowledge of your business is an essential part of the work. We build in opportunities to share ideas, review the direction, and give feedback.',
  ],
  [
    'Can you redesign my existing website?',
    'Yes. We can review your current website together, discuss what is working, and define the changes that make sense for your goals and platform.',
  ],
  [
    'Do you offer support after launch?',
    'Yes. Launch includes 14 days of post-launch support; Business and Scale include 30 days. We can also discuss ongoing care, with scope and terms agreed separately.',
  ],
  [
    'What happens after I submit an inquiry?',
    'We review your project details and follow up to discuss your goals. After discovery, we outline a proposal. Scope, contract, and payment arrangements are agreed before project kickoff.',
  ],
]
const number = (index: number) => String(index + 1).padStart(2, '0')

export default function ServicesPage() {
  const plans = [
    {
      name: 'Launch',
      price: '$750',
      bestFor: 'New businesses getting online',
      pages: '1-3',
      cms: '-',
      blog: '-',
      advancedFunctionality: '-',
      ecommerce: '-',
      customIntegrations: '-',
      postLaunchSupport: '14 days',
      description:
        'For new businesses that need a professional online presence.',
      details: [
        '1-3 pages',
        'Custom website design',
        'Responsive design',
        'Contact form',
        'Basic SEO',
        'Analytics',
        '14 days post-launch support',
      ],
    },
    {
      name: 'Business',
      featured: true,
      price: '$1,200',
      bestFor: 'Growing businesses',
      pages: '4-7',
      cms: 'Yes',
      blog: 'Yes',
      advancedFunctionality: '-',
      ecommerce: '-',
      customIntegrations: '-',
      postLaunchSupport: '30 days',
      description:
        'For growing businesses that need a complete website built around their goals.',
      details: [
        '4-7 pages',
        'Custom website design',
        'Responsive design',
        'CMS',
        'Contact forms',
        'Blog / News',
        'Basic SEO',
        'Analytics',
        '30 days post-launch support',
      ],
    },
    {
      name: 'Scale',
      price: '$2,000+',
      bestFor: 'Established businesses',
      pages: '8+',
      cms: 'Yes',
      blog: 'Yes',
      advancedFunctionality: 'Yes',
      ecommerce: 'Yes',
      customIntegrations: 'Yes',
      postLaunchSupport: '30 days',
      description:
        'For established businesses that need advanced functionality and a more customized website.',
      details: [
        '8+ pages',
        'Custom website design',
        'Responsive design',
        'CMS',
        'Blog / News',
        'Advanced functionality',
        'E-commerce',
        'Custom integrations',
        'Basic SEO',
        'Analytics',
        '30 days post-launch support',
      ],
    },
  ]

  return (
    <div className={styles.page}>
      <PublicMetadata
        title="Web Design & Creative Services | Bycra"
        description="Discover Bycra’s collaborative approach to website design, development, e-commerce, and website care. Thoughtful design, clear communication, and a process built around your business."
      />
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        />
      </Head>
      <Header />
      <main id="services-main">
        <section
          className={`${styles.section} ${styles.hero}`}
          aria-labelledby="services-title"
        >
          <div className={styles.heroTop}>
            <p className={styles.eyebrow}>What we do</p>
            <span className={styles.small}>
              Independent thinking. Personal attention.
            </span>
          </div>
          <h1 id="services-title">
            More Than a Website.
            <br />
            <span>An Experience</span>
            <br />
            Built Around You.
          </h1>
          <div className={styles.heroBottom}>
            <a className={styles.explore} href="#our-services">
              <span aria-hidden="true">↘</span> Explore Our Services
            </a>
            <div className={styles.heroCopy}>
              <p>
                Your business deserves more than a beautiful website. It
                deserves a thoughtful creative process built around your vision,
                your goals, and the people you serve.
              </p>
              <p>
                At Bycra, we combine purposeful design, clear communication, and
                collaborative thinking to create digital experiences that feel
                uniquely yours.
              </p>
              <Link className={styles.button} href="/contact">
                Start Your Project <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className={styles.heroRule} aria-hidden="true">
            <span>Vision</span>
            <span>Design</span>
            <span>Development</span>
            <span>Connection</span>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.experience}`}
          aria-labelledby="experience-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>The Bycra Experience</p>
              <h2 id="experience-title">
                Great Design Starts With a Great Experience.
              </h2>
            </div>
            <div className={styles.introCopy}>
              <p>
                We believe the journey matters just as much as the finished
                product.
              </p>
              <p>
                From our first conversation to your website’s launch, our
                process is designed to keep you informed, involved, and
                confident every step of the way.
              </p>
            </div>
          </div>
          <div className={styles.pillars}>
            {pillars.map(([title, body], index) => (
              <div className={styles.pillar} key={title}>
                <span className={styles.number}>{number(index)}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="our-services"
          className={styles.section}
          aria-labelledby="offerings-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>What we create</p>
              <h2 id="offerings-title">
                Thoughtful Solutions for Ambitious Businesses.
              </h2>
            </div>
            <p className={styles.introCopy}>
              Whether you’re building your digital presence from the ground up
              or refining what already exists, Bycra offers creative solutions
              designed around your business.
            </p>
          </div>
          {services.map((service, index) => (
            <article className={styles.service} key={service.label}>
              <div className={styles.serviceVisual} aria-hidden="true">
                <span className={styles.visualIndex}>{number(index)}</span>
                <div className={styles.visualType}>
                  {service.visual[0]}
                  <br />
                  <em>{service.visual[1]}</em>
                </div>
                <div className={styles.visualLines}>
                  <i />
                  <i />
                  <i />
                </div>
                <span className={styles.visualCaption}>{service.caption}</span>
              </div>
              <div className={styles.serviceCopy}>
                <p className={styles.eyebrow}>
                  Service {number(index)} / {service.label}
                </p>
                <h3>{service.title}</h3>
                {service.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {service.review && (
                  <p className={styles.review}>{service.review}</p>
                )}
                <h4>
                  {service.review
                    ? 'Potential areas to discuss'
                    : 'Services may include'}
                </h4>
                <ul className={styles.inclusions}>
                  {service.inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href="/contact" className={styles.textLink}>
                  {service.cta} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section
          className={`${styles.section} ${styles.process}`}
          aria-labelledby="process-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>How we work</p>
              <h2 id="process-title">
                A Thoughtful Process.
                <br />
                From Start to Finish.
              </h2>
            </div>
            <div className={styles.introCopy}>
              <p>
                Every successful project begins with understanding your business
                and ends with a digital experience you’re excited to share.
              </p>
              <p>
                Our collaborative process is designed to make every step clear,
                organized, and enjoyable.
              </p>
            </div>
          </div>
          <ol className={styles.timeline}>
            {process.map(([title, body], index) => (
              <li key={title}>
                <span className={styles.number}>{number(index)}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="investment-title">
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>Your investment</p>
              <h2 id="investment-title">
                An Investment in Your Business’s Next Chapter.
              </h2>
            </div>
            <div className={styles.introCopy}>
              <p>Every business has different needs, goals, and ambitions.</p>
              <p>
                Our website offerings provide a starting point, while our
                discovery process helps determine the right approach for your
                project.
              </p>
            </div>
          </div>
          <div className={styles.plans}>
            {plans.map((plan) => (
              <article
                className={`${styles.plan} ${plan.featured ? styles.featured : ''}`}
                key={plan.name}
              >
                <p className={styles.eyebrow}>{plan.bestFor}</p>
                <h3>{plan.name}</h3>
                <p className={styles.price}>
                  <span>Starting at</span> {plan.price}
                </p>
                <p>{plan.description}</p>
                <ul>
                  {plan.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <Link
                  className={styles.textLink}
                  href={`/contact?package=${plan.name.toLowerCase()}`}
                >
                  Discuss Your Project <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
          <p className={styles.investmentNote}>
            A starting point, not a one-size-fits-all solution. We’ll confirm
            your scope and investment together before work begins.
          </p>
        </section>

        <section
          className={`${styles.section} ${styles.work}`}
          aria-labelledby="work-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>Our work</p>
              <h2 id="work-title">
                Thoughtful Design.
                <br />
                Real Businesses.
              </h2>
            </div>
            <p className={styles.introCopy}>
              Every project is an opportunity to understand a business, solve
              meaningful challenges, and create something that reflects the
              people behind it.
            </p>
          </div>
          <div className={styles.projects}>
            {featuredProjects.map((project) => (
              <article key={project.slug}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className={styles.projectImage}
                >
                  <img
                    src={project.heroImage}
                    alt={`${project.title} — project artwork`}
                    width={640}
                    height={400}
                    loading="lazy"
                  />
                </Link>
                <p className={styles.eyebrow}>
                  {project.slug === 'handyservant-platform'
                    ? 'Responsive multi-page website'
                    : 'Agency landing page'}
                </p>
                <h3>
                  <Link href={`/portfolio/${project.slug}`}>
                    {project.title} <span aria-hidden="true">↗</span>
                  </Link>
                </h3>
                <p>{project.solution}</p>
              </article>
            ))}
          </div>
          <Link href="/portfolio" className={styles.textLink}>
            View Our Work <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <section
          className={`${styles.section} ${styles.faq}`}
          aria-labelledby="faq-title"
        >
          <div>
            <p className={styles.eyebrow}>Good to know</p>
            <h2 id="faq-title">Questions Before We Begin?</h2>
            <p>Clarity from the very first conversation.</p>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.closing}`}
          aria-labelledby="closing-title"
        >
          <p className={styles.eyebrow}>Let’s create something meaningful</p>
          <h2 id="closing-title">
            Your Vision Deserves
            <br />a Thoughtful Approach.
          </h2>
          <p>
            Whether you’re launching something new or preparing for your next
            chapter, we’d love to learn about your business and explore what’s
            possible together.
          </p>
          <p>Let’s create a digital experience that feels uniquely yours.</p>
          <div className={styles.actions}>
            <Link className={styles.button} href="/contact">
              Let’s Talk About Your Project <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.textLink} href="/portfolio">
              View Our Work <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className={styles.signature} aria-hidden="true">
            Thoughtfully designed. Built together.
          </div>
        </section>
      </main>
    </div>
  )
}
