import { DiscoveryFormData } from './types'

const SERVICE_TYPE_LABELS: Record<DiscoveryFormData['serviceType'], string> = {
  launch: 'Launch',
  business: 'Business',
  scale: 'Scale',
  'custom-project': 'Custom Project',
}

export const formatServiceTypeLabel = (serviceType: string) => {
  return SERVICE_TYPE_LABELS[serviceType as DiscoveryFormData['serviceType']] || serviceType
}
