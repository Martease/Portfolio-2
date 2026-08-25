import { createHmac, timingSafeEqual } from 'crypto'

type UploadSessionPayload = {
  v: 1
  contractId: string
  projectId: number
  documentId: number
  objectKey: string
  contentType: string
  maxBytes: number
  actorId: string
  exp: number
}

const base64UrlEncode = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

const getTokenSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required for upload session signing')
  }

  return secret
}

const sign = (payloadB64: string) => {
  return createHmac('sha256', getTokenSecret()).update(payloadB64).digest('base64url')
}

export const createSignedCopyUploadSessionToken = (payload: UploadSessionPayload) => {
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(payloadB64)
  return `${payloadB64}.${signature}`
}

export const verifySignedCopyUploadSessionToken = (token: string) => {
  const [payloadB64, signature] = token.split('.')

  if (!payloadB64 || !signature) {
    throw new Error('Invalid upload session token format')
  }

  const expectedSignature = sign(payloadB64)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid upload session token signature')
  }

  const payload = JSON.parse(base64UrlDecode(payloadB64)) as UploadSessionPayload

  if (payload.v !== 1) {
    throw new Error('Unsupported upload session token version')
  }

  if (Date.now() >= payload.exp) {
    throw new Error('Upload session token has expired')
  }

  return payload
}
