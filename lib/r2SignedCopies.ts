import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

type SignedCopyStorageConfig = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  endpoint: string
  putTtlSeconds: number
  getTtlSeconds: number
  maxBytes: number
  contentType: string
}

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const requireEnv = (name: string) => {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`${name} is required`)
  }

  return value.trim()
}

export const getSignedCopyStorageConfig = (): SignedCopyStorageConfig => {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucket: requireEnv('R2_BUCKET_SIGNED_COPIES'),
    endpoint: requireEnv('R2_ENDPOINT'),
    putTtlSeconds: parsePositiveInt(process.env.R2_PRESIGNED_PUT_TTL_SECONDS, 300),
    getTtlSeconds: parsePositiveInt(process.env.R2_PRESIGNED_GET_TTL_SECONDS, 60),
    maxBytes: parsePositiveInt(process.env.SIGNED_COPY_MAX_BYTES, 25 * 1024 * 1024),
    contentType: 'application/pdf',
  }
}

const createR2Client = (config: SignedCopyStorageConfig) => {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  })
}

const hashId = (value: string) => {
  const normalized = Buffer.from(value).toString('base64url')
  return normalized.slice(0, 16)
}

export const buildSignedCopyObjectKey = (params: {
  contractId: string
  documentId: number
}) => {
  const contractPart = hashId(params.contractId)
  const documentPart = hashId(String(params.documentId))
  const objectId = randomUUID()
  return `contracts/${contractPart}/documents/${documentPart}/signed/${objectId}.pdf`
}

export const createSignedCopyUploadUrl = async (params: {
  objectKey: string
}) => {
  const config = getSignedCopyStorageConfig()
  const client = createR2Client(config)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: params.objectKey,
    ContentType: config.contentType,
  })

  const url = await getSignedUrl(client, command, { expiresIn: config.putTtlSeconds })

  return {
    url,
    expiresIn: config.putTtlSeconds,
    contentType: config.contentType,
    maxBytes: config.maxBytes,
  }
}

export const getSignedCopyObjectMetadata = async (params: {
  objectKey: string
}) => {
  const config = getSignedCopyStorageConfig()
  const client = createR2Client(config)

  const response = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: params.objectKey,
    })
  )

  return {
    contentType: response.ContentType || '',
    contentLength: response.ContentLength ?? 0,
  }
}

export const deleteSignedCopyObject = async (params: {
  objectKey: string
}) => {
  const config = getSignedCopyStorageConfig()
  const client = createR2Client(config)

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: params.objectKey,
    })
  )
}

export const createSignedCopyDownloadUrl = async (params: {
  objectKey: string
  fileName: string
}) => {
  const config = getSignedCopyStorageConfig()
  const client = createR2Client(config)

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: params.objectKey,
    ResponseContentType: config.contentType,
    ResponseContentDisposition: `inline; filename="${params.fileName}"`,
  })

  const url = await getSignedUrl(client, command, { expiresIn: config.getTtlSeconds })

  return {
    url,
    expiresIn: config.getTtlSeconds,
  }
}
