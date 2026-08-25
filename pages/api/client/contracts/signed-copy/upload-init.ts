import type { NextApiRequest, NextApiResponse } from 'next'
import { validateInteger } from '../../../../../lib/adminSecurity'
import { ensureProjectByContract, getContractDocumentById } from '../../../../../lib/clientPortalStore'
import { getContract } from '../../../../../lib/contractStore'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../../../lib/portalAccess'
import { buildSignedCopyObjectKey, createSignedCopyUploadUrl, getSignedCopyStorageConfig } from '../../../../../lib/r2SignedCopies'
import { createSignedCopyUploadSessionToken } from '../../../../../lib/signedCopyUploadSession'

type Body = {
  documentId?: number
}

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

  const payload = (req.body || {}) as Body
  let documentId = 0

  try {
    documentId = validateInteger(payload.documentId, 'documentId', { min: 1 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid documentId'
    return res.status(400).json({ message })
  }

  const target = await getContractDocumentById(documentId)
  if (!target || target.contract_id !== contract.contract_id) {
    return res.status(404).json({ message: 'Contract document not found.' })
  }

  const objectKey = buildSignedCopyObjectKey({
    contractId: contract.contract_id,
    documentId,
  })

  const upload = await createSignedCopyUploadUrl({ objectKey })
  const config = getSignedCopyStorageConfig()
  const actorId = capability?.id
    ? `capability:${capability.id}`
    : `session:${access.session.user?.id || access.session.user?.email || access.session.user?.role || 'unknown'}`

  const uploadToken = createSignedCopyUploadSessionToken({
    v: 1,
    contractId: contract.contract_id,
    projectId: project.id,
    documentId,
    objectKey,
    contentType: upload.contentType,
    maxBytes: config.maxBytes,
    actorId,
    exp: Date.now() + upload.expiresIn * 1000,
  })

  return res.status(200).json({
    upload: {
      url: upload.url,
      method: 'PUT',
      headers: {
        'Content-Type': upload.contentType,
      },
      maxBytes: upload.maxBytes,
      expiresIn: upload.expiresIn,
    },
    uploadToken,
  })
}
