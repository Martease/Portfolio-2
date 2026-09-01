'use client'

import { FormEvent, useState } from 'react'

const Contact = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) && value.length <= 200
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim() }),
      })

      const data = await response.json() as { message?: string }

      if (!response.ok) {
        setError(data.message || 'Failed to send message')
        return
      }

      setSuccess(true)
      setEmail('')
      setMessage('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/70 text-center">
        <h2 className="text-4xl font-bold text-slate-900">Let's Connect</h2>
        <p className="mt-4 text-slate-700">
          Send a message to discuss your next project, request a quote, or explore how Mamvo Labs can support your business goals.
        </p>

        {success && <p className="mt-4 text-sm text-green-600">Message sent successfully! We'll get back to you soon.</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <form className="mt-10 grid gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            maxLength={200}
            required
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
          />
          <textarea
            placeholder="Your message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            maxLength={1000}
            rows={4}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-3xl bg-black px-8 py-4 text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
