import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InquiryData, InquirySchema, inquiryServices, inquiryBudgets, inquiryTimelines } from '../lib/inquiry'
import styles from '../styles/Inquiry.module.css'

export default function DiscoveryForm() {
  const router = useRouter()
  const [startedAt] = useState(() => Date.now())
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const locked = useRef(false)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<InquiryData>({
    resolver: zodResolver(InquirySchema),
    defaultValues: { inquiryVersion: 1, serviceType: 'custom-project', services: [] },
  })
  useEffect(() => {
    const value = router.query.package || router.query.service
    if (typeof value === 'string' && ['launch', 'business', 'scale', 'custom-project'].includes(value)) {
      setValue('serviceType', value as InquiryData['serviceType'])
      setValue('services', ['Website Design & Development'])
    }
  }, [router.query, setValue])
  useEffect(() => { if (submitted) successHeading.current?.focus() }, [submitted])

  const submit = async (data: InquiryData) => {
    if (locked.current) return
    locked.current = true
    setError('')
    try {
      const response = await fetch('/api/submit-discovery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, company, formStartedAt: startedAt }),
      })
      const result = await response.json()
      if (!response.ok || result.accepted !== true) throw new Error(response.status === 429 ? 'Please wait a moment and try again.' : 'We couldn’t send your inquiry. Please try again. Your answers are still here.')
      setSubmitted(true)
      const detail = { event: 'discovery_form_submitted', serviceType: data.serviceType, budgetRange: data.budgetRange }
      const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer
      dataLayer?.push(detail)
      window.dispatchEvent(new CustomEvent('discovery:submitted', { detail }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect. Please try again. Your answers are still here.')
    } finally { locked.current = false }
  }

  const field = (name: 'fullName' | 'email' | 'businessName' | 'website' | 'business' | 'goals' | 'notes', label: string, optional = false, textarea = false, helper?: string) => (
    <div className={styles.field}>
      <label htmlFor={name}>{label} {optional ? <span>(optional)</span> : <span aria-hidden="true">*</span>}</label>
      {helper && <p id={`${name}-hint`} className={styles.helper}>{helper}</p>}
      {textarea ? <textarea id={name} rows={4} maxLength={3000} required={!optional} aria-invalid={!!errors[name]} aria-describedby={[helper && `${name}-hint`, errors[name] && `${name}-error`].filter(Boolean).join(' ') || undefined} {...register(name)} /> :
        <input id={name} type={name === 'email' ? 'email' : 'text'} autoComplete={name === 'fullName' ? 'name' : name === 'email' ? 'email' : name === 'businessName' ? 'organization' : 'url'} maxLength={name === 'fullName' ? 120 : name === 'website' ? 500 : 200} required={!optional} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} {...register(name)} />}
      {errors[name] && <p id={`${name}-error`} className={styles.error}>{errors[name]?.message}</p>}
    </div>
  )
  if (submitted) return <div className={styles.success} role="status"><p className={styles.eyebrow}>A new beginning</p><h2 ref={successHeading} tabIndex={-1}>Your Story Starts Here.</h2><p>Thank you for reaching out to Bycra!</p><p>We’ve received your inquiry and look forward to learning more about your business.</p><p>Keep an eye on your inbox for information about the next steps.</p><Link href="/" className={styles.button}>Back to Homepage <span aria-hidden="true">→</span></Link></div>
  return <form onSubmit={handleSubmit(submit)} noValidate className={styles.form} aria-busy={isSubmitting}>
    <p className={styles.helper}>A few thoughtful details to get us started. Fields marked * are required.</p>
    <div hidden aria-hidden="true"><label htmlFor="company">Leave this empty</label><input id="company" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={e => setCompany(e.target.value)} /></div>
    <fieldset disabled={isSubmitting}><legend><span>01</span> The Introduction</legend><div className={styles.twoColumns}>{field('fullName', 'Your Name')}{field('email', 'Email Address')}{field('businessName', 'Business Name', true)}{field('website', 'Website or Social Media Link', true)}</div></fieldset>
    <fieldset disabled={isSubmitting}><legend><span>02</span> Your Project</legend>
      <fieldset className={styles.services} aria-describedby={errors.services ? 'services-error' : 'services-hint'}><legend>What Can We Help You With? <span aria-hidden="true">*</span></legend><p id="services-hint" className={styles.helper}>Choose all that feel right.</p><div className={styles.choices}>{inquiryServices.map(service => <label key={service}><input type="checkbox" value={service} {...register('services')} /><span>{service}</span></label>)}</div>{errors.services && <p id="services-error" className={styles.error}>{errors.services.message}</p>}</fieldset>
      {field('business', 'Tell Us a Little About Your Business', false, true)}
      {field('goals', 'What Are You Hoping to Accomplish?', false, true, 'Tell us about your ideas, goals, or challenges. You don’t need to have everything figured out.')}
    </fieldset>
    <fieldset disabled={isSubmitting}><legend><span>03</span> Project Details</legend><div className={styles.twoColumns}>
      {(['budgetRange', 'timeline'] as const).map(name => <div className={styles.field} key={name}><label htmlFor={name}>{name === 'budgetRange' ? 'What’s Your Estimated Investment?' : 'When Would You Ideally Like to Get Started?'} <span aria-hidden="true">*</span></label><select id={name} required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} defaultValue="" {...register(name)}><option value="" disabled>Please select</option>{(name === 'budgetRange' ? inquiryBudgets : inquiryTimelines).map(option => <option key={option}>{option}</option>)}</select>{errors[name] && <p className={styles.error} id={`${name}-error`}>{errors[name]?.message}</p>}</div>)}
    </div>{field('notes', 'Anything Else We Should Know?', true, true)}</fieldset>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <button className={styles.button} disabled={isSubmitting} type="submit">{isSubmitting ? 'Sending Your Inquiry…' : 'Send My Inquiry'} <span aria-hidden="true">→</span></button>
    <p className={styles.helper}>This is the beginning of a conversation. No commitment required.</p>
  </form>
}
