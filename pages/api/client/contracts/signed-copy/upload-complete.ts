import type { NextApiRequest, NextApiResponse } from 'next'
import { enforceSignedCopySubmitRateLimit, validateInteger, validateString } from '../../../../../lib/adminSecurity'
import { logAdminAudit } from '../../../../../lib/auditLogStore'
import { capabilityAuditSubject } from '../../../../../lib/capabilities'
import {
  ensureProjectByContract,
  getContractDocumentById,
  uploadSignedContractCopyObjectKey,
} from '../../../../../lib/clientPortalStore'
import { getContract } from '../../../../../lib/contractStore'
import {
  deleteSignedCopyObject,
  getSignedCopyObjectMetadata,
  getSignedCopyStorageConfig,
} from '../../../../../lib/r2SignedCopies'
import { verifySignedCopyUploadSessionToken } from '../../../../../lib/signedCopyUploadSession'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../../../lib/portalAccess'

type Body = {
  documentId?: number
  uploadToken?: string
}

const normalizeContentType = (value: string) => value.split(';')[0].trim().toLowerCase()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const access = await authorizePortalSession(req, res)
  if (!access) {
    return
  }

  const contract = await getContract(access.contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found.' })
  }

  const project = await ensureProjectByContract(contract.contract_id, contract.client_name)

  const capability = await authorizeCapabilityAccess(req, res, {
    contractId: contract.contract_id,
    projectId: project.id,
    requiredScopes: 'SIGNED_COPY_SUBMIT',
    required: !access.isAdmin,
  })
  if (!capability && !access.isAdmin) {
    return
  }

  const signedCopyActorKey = capability?.id
    ? `capability:${capability.id}`
    : `session:${access.session.user?.id || access.session.user?.email || access.session.user?.role || 'unknown'}`

  if (!await enforceSignedCopySubmitRateLimit(req, res, signedCopyActorKey)) {
    return
  }

  const payload = (req.body || {}) as Body

  let documentId = 0
  let uploadToken = ''

  try {
    documentId = validateInteger(payload.documentId, 'documentId', { min: 1 })
    uploadToken = validateString(payload.uploadToken, 'uploadToken', { min: 32, max: 4000 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid payload'
    return res.status(400).json({ message })
  }

  const target = await getContractDocumentById(documentId)
  if (!target || target.contract_id !== contract.contract_id) {
    return res.status(404).json({ message: 'Contract document not found.' })
  }

  let uploadSession: ReturnType<typeof verifySignedCopyUploadSessionToken>
  try {
    uploadSession = verifySignedCopyUploadSessionToken(uploadToken)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid upload session token'
    return res.status(400).json({ message })
  }

  if (
    uploadSession.contractId !== contract.contract_id ||
    uploadSession.projectId !== project.id ||
    uploadSession.documentId !== documentId
  ) {
    return res.status(403).json({ message: 'Upload session does not match the requested contract document.' })
  }

  if (uploadSession.actorId !== signedCopyActorKey) {
    return res.status(403).json({ message: 'Upload session does not belong to the current actor.' })
  }

  const config = getSignedCopyStorageConfig()

  let objectMetadata: { contentType: string; contentLength: number }
  try {
    objectMetadata = await getSignedCopyObjectMetadata({ objectKey: uploadSession.objectKey })
  } catch {
    return res.status(404).json({ message: 'Uploaded object was not found.' })
  }

  const actualContentType = normalizeContentType(objectMetadata.contentType)
  const allowedContentType = normalizeContentType(config.contentType)

  if (actualContentType !== allowedContentType) {
    await deleteSignedCopyObject({ objectKey: uploadSession.objectKey })
    return res.status(400).json({ message: `Signed copy must use ${config.contentType}.` })
  }

  if (!Number.isFinite(objectMetadata.contentLength) || objectMetadata.contentLength <= 0) {
    await deleteSignedCopyObject({ objectKey: uploadSession.objectKey })
    return res.status(400).json({ message: 'Uploaded object size is invalid.' })
  }

  if (objectMetadata.contentLength > config.maxBytes) {
    await deleteSignedCopyObject({ objectKey: uploadSession.objectKey })
    return res.status(400).json({ message: 'Signed copy exceeds the maximum allowed file size.' })
  }

  const updated = await uploadSignedContractCopyObjectKey(documentId, uploadSession.objectKey)
  if (!updated) {
    return res.status(500).json({ message: 'Failed to associate signed copy with the document.' })
  }

  await logAdminAudit({
    actorEmail: capability ? capabilityAuditSubject(capability.id) : (access.session.user?.email || 'client@local'),
    actorRole: capability ? 'capability' : (access.session.user?.role || 'client'),
    action: 'contracts.signed_copy_upload_complete',
    entityType: 'contract_document',
    entityId: documentId,
    metadata: {
      contractId: contract.contract_id,
      projectId: project.id,
      documentId,
      objectKey: uploadSession.objectKey,
      contentType: actualContentType,
      contentLength: objectMetadata.contentLength,
      overwriteExistingObject: Boolean(target.signed_copy_object_key),
      overwriteLegacyUrl: Boolean(target.signed_copy_url),
      submissionMode: capability ? 'capability' : 'session',
    },
  })

  return res.status(200).json({
    message: 'Signed copy upload completed.',
    document: {
      id: updated.id,
      contract_id: updated.contract_id,
      title: updated.title,
      signed_copy_available: true,
      updated_at: updated.updated_at,
    },
  })
}
