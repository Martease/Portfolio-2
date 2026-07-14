import Header from '../components/Header'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import SectionHeading from '../components/ui/SectionHeading'
import SurfaceCard from '../components/ui/SurfaceCard'
import { FormEvent, useState } from 'react'
import { CONTACT_EMAIL } from '../lib/contactConfig'

export default function ContactPage() {
  const [formStartedAt] = useState(() => Date.now())
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitted(false)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          company,
          formStartedAt,
        }),
      })

      const data = (await response.json().catch(() => ({ message: 'Failed to send message.' }))) as {
        message?: string
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message.')
      }

      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (submitError) {
      const messageText = submitError instanceof Error ? submitError.message : 'Failed to send message.'
      setError(messageText)
    } finally {
      setSubmitting(false)
    }
  }

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
            <h2 className="font-display text-2xl text-brand-ink">Contact Form</h2>
            <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>
              <FormField
                id="name"
                label="Name"
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <FormField
                id="email"
                label="Email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <FormField
                as="textarea"
                id="message"
                label="Project Details"
                required
                placeholder="Tell me about the project"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button type="submit" className="w-full sm:w-auto">
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {submitted ? (
                <p className="text-sm text-brand-slate">
                  Your message was sent successfully to {CONTACT_EMAIL}.
                </p>
              ) : null}
            </form>
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