import { useState } from 'react'
import { formatUsd, hireMeServiceOptions } from '../lib/serviceCatalog'

const About = () => {
  const [showHireOptions, setShowHireOptions] = useState(false)

  const startCheckout = async (service: string, amount: number) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service, amount }),
      })

      const data = await response.json().catch(() => ({} as { message?: string; url?: string }))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session')
      }

      if (!data.url) {
        throw new Error('Checkout session did not return a redirect URL.')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      const message = error instanceof Error ? error.message : 'Failed to initiate checkout. Please try again.'
      alert(message)
    }
  }

  return (
    <section id="about" className="py-20 px-6 bg-slate-50">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70">
        <h2 className="text-4xl font-semibold text-orange-900">About Mamvo Labs</h2>
        <p className="mt-6 text-lg leading-8 text-slate-700">
          At Mamvo Labs, we don't just write code; we architect digital infrastructure designed to perform, scale, and endure. Founded by and built on the principles of precision and continuous improvement, Mamvo Labs serves as the technical engine for ambitious projects and enterprise-level solutions.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">The Philosophy</h3>
            <p className="mt-4 text-slate-700 leading-relaxed">
              We operate at the intersection of complex backend logic and intuitive user experiences. We believe that technology should be a quiet, powerful force—invisible to the user, yet robust enough to support enterprise-grade demands.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Systematic Excellence</h3>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Our process is rooted in a highly structured, systematic framework. We utilize disciplined planning and engineering to ensure every line of code serves a strategic business objective.
            </p>
          </div>
        </div>

        <ul className="mt-10 grid gap-5 text-slate-700 sm:grid-cols-2">
          <li className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <strong className="block text-lg font-semibold text-slate-900">Engineering-First Mindset</strong>
            We prioritize backend stability, cloud architecture, and data engineering, ensuring every system is built on a foundation of reliability.
          </li>
          <li className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <strong className="block text-lg font-semibold text-slate-900">Technological Integration</strong>
            From complex APIs to custom discovery engines, we build bridges between raw data and meaningful digital products.
          </li>
          <li className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <strong className="block text-lg font-semibold text-slate-900">Professional Continuity</strong>
            With deep roots in software development, we approach every contract with discipline, ownership, and a long-term mindset.
          </li>
        </ul>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-700 leading-relaxed">
            Mamvo Labs is not just a service provider; we are a long-term technical partner dedicated to bringing sophisticated, scalable ideas to life.
          </p>
          <button
            type="button"
            onClick={() => setShowHireOptions((prev) => !prev)}
            className="inline-flex rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-white transition hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-600/50"
          >
            Hire Me
          </button>
        </div>

        {showHireOptions && (
          <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5">
            <h4 className="text-lg font-semibold text-orange-900">What are you looking for?</h4>
            <p className="mt-2 text-sm text-orange-700">
              Choose an option to continue to secure checkout.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hireMeServiceOptions.map((option) => (
                <button
                  key={option.hireMeLabel}
                  type="button"
                  onClick={() => startCheckout(option.title, option.amount)}
                  className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-left text-orange-900 transition hover:bg-orange-100"
                >
                  <span className="font-medium">{option.hireMeLabel}</span>
                  <p className="mt-1 text-sm text-orange-700">Starting at {formatUsd(option.amount)}</p>
                </button>
              ))}

              <a
                href="#contact"
                className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-orange-900 transition hover:bg-orange-100"
              >
                Other / Custom Request
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default About
