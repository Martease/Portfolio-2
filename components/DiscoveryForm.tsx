import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import Button from './ui/Button'
import FormField from './ui/FormField'
import { DiscoveryFormData, DiscoveryFormSchema } from '../lib/types'

const SERVICE_OPTIONS: Array<{
  value: DiscoveryFormData['serviceType']
  label: string
}> = [
  { value: 'launch', label: 'Launch' },
  { value: 'business', label: 'Business' },
  { value: 'scale', label: 'Scale' },
  { value: 'custom-project', label: 'Custom Project' },
]

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 - $2,500',
  '$2,500 - $5,000',
  '$5,000 - $10,000',
  '$10,000+',
]

type SubmitDiscoveryResponse = {
  message?: string
}

export default function DiscoveryForm() {
  const searchParams = useSearchParams()
  const [formStartedAt] = useState(() => Date.now())
  const [company, setCompany] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DiscoveryFormData>({
    resolver: zodResolver(DiscoveryFormSchema),
    defaultValues: {
      serviceType: 'custom-project',
      budgetRange: '',
      preferredPlatform: '',
      description: '',
      email: '',
      fullName: '',
    },
  })

  const selectedService = watch('serviceType')

  useEffect(() => {
    if (!searchParams) return

    const packageParam = searchParams.get('package')
    const serviceParam = searchParams.get('service')
    const selectedParam = packageParam || serviceParam

    if (selectedParam && SERVICE_OPTIONS.some((option) => option.value === selectedParam)) {
      setValue('serviceType', selectedParam as DiscoveryFormData['serviceType'], {
        shouldDirty: true, 
        shouldValidate: true 
      })
    }
  }, [searchParams, setValue])

  useEffect(() => {
    if (!toastMessage) return
    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 4000)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toastMessage])

  const trackDiscoverySubmitted = (data: DiscoveryFormData) => {
    if (typeof window === 'undefined') return
    const eventPayload = {
      event: 'discovery_form_submitted',
      serviceType: data.serviceType,
      budgetRange: data.budgetRange,
    }
    const maybeDataLayer = (window as unknown as { dataLayer?: unknown }).dataLayer
    if (Array.isArray(maybeDataLayer)) {
      maybeDataLayer.push(eventPayload)
    }
    window.dispatchEvent(new CustomEvent('discovery:submitted', { detail: eventPayload }))
  }

  const onSubmit = async (data: DiscoveryFormData) => {
    setSubmitError('')
    setSubmitted(false)
    const response = await fetch('/api/submit-discovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        company,
        formStartedAt,
      }),
    })
    const result = (await response.json().catch(() => ({ message: 'Failed to submit request.' }))) as SubmitDiscoveryResponse
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit request.')
    }
    trackDiscoverySubmitted(data)
    setSubmitted(true)
    setToastMessage('Discovery request sent successfully.')
    reset({
      serviceType: 'custom-project',
      budgetRange: '',
      preferredPlatform: '',
      description: '',
      email: '',
      fullName: '',
    })
    setCompany('')
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          await onSubmit(data)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to submit request.'
          setSubmitError(message)
        }
      })}
      className="space-y-6"
    >
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
        id="fullName"
        label="Full Name"
        type="text"
        placeholder="Your full name"
        {...register('fullName')}
      />
      {errors.fullName ? <p className="text-xs text-red-700">{errors.fullName.message}</p> : null}

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register('email')}
      />
      {errors.email ? <p className="text-xs text-red-700">{errors.email.message}</p> : null}

      <div>
        <p className="text-sm font-semibold text-brand-ink">Service Type</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {SERVICE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('serviceType', option.value, { shouldDirty: true, shouldValidate: true })}
              className={[
                'rounded-xl border px-3 py-2 text-left text-sm capitalize transition',
                selectedService === option.value ? 'border-brand-ember bg-brand-sand text-brand-ink' : 'border-brand-cloud hover:border-brand-ember',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.serviceType ? <p className="mt-1 text-xs text-red-700">{errors.serviceType.message}</p> : null}
      </div>

      <label htmlFor="budgetRange" className="block text-sm font-semibold text-brand-ink">
        Budget Range
        <select
          id="budgetRange"
          className="mt-2 w-full rounded-xl border border-brand-cloud bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-ember focus:ring-2 focus:ring-brand-ember/20"
          {...register('budgetRange')}
        >
          <option value="">Select your budget</option>
          {BUDGET_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>
      {errors.budgetRange ? <p className="text-xs text-red-700">{errors.budgetRange.message}</p> : null}

      <FormField
        id="preferredPlatform"
        label="Preferred Platform"
        type="text"
        placeholder="Optional (Webflow, WordPress, Next.js, etc.)"
        {...register('preferredPlatform')}
      />

      <FormField
        as="textarea"
        id="description"
        label="Project Description"
        placeholder="Tell me about your project goals, timeline, and requirements."
        rows={6}
        {...register('description')}
      />
      {errors.description ? <p className="text-xs text-red-700">{errors.description.message}</p> : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </Button>
      {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}
      {submitted ? <p className="text-sm text-brand-slate">Your discovery request was submitted successfully.</p> : null}
      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-brand-ink px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toastMessage}
        </div>
      ) : null}
    </form>
  )
}

