type DiscoverySubmittedDetail = {
  event: 'discovery_form_submitted'
  serviceType: string
  budgetRange: string
}

type DataLayerPayload = DiscoverySubmittedDetail

declare global {
  interface Window {
    dataLayer?: Array<DataLayerPayload>
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void
  }
}

const DISCOVERY_EVENT_NAME = 'discovery:submitted'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDiscoveryDetail = (value: unknown): value is DiscoverySubmittedDetail => {
  if (!isRecord(value)) return false
  return (
    value.event === 'discovery_form_submitted' &&
    typeof value.serviceType === 'string' &&
    typeof value.budgetRange === 'string'
  )
}

export function registerDiscoveryAnalyticsListener() {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<unknown>
    const detail = customEvent.detail
    if (!isDiscoveryDetail(detail)) return

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'discovery_form_submitted', {
        service_type: detail.serviceType,
        budget_range: detail.budgetRange,
      })
    }

    if (typeof window.plausible === 'function') {
      window.plausible('Discovery Form Submitted', {
        props: {
          serviceType: detail.serviceType,
          budgetRange: detail.budgetRange,
        },
      })
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(detail)
    }
  }

  window.addEventListener(DISCOVERY_EVENT_NAME, handler)

  return () => {
    window.removeEventListener(DISCOVERY_EVENT_NAME, handler)
  }
}