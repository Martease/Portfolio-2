import type { NextApiRequest, NextApiResponse } from 'next'
import { validateInteger } from '../../../../../lib/adminSecurity'
import { ensureProjectByContract, getContractDocumentById } from '../../../../../lib/clientPortalStore'
import { getContract } from '../../../../../lib/contractStore'
import { createSignedCopyDownloadUrl } from '../../../../../lib/r2SignedCopies'
import { authorizeCapabilityAccess, authorizePortalSession } from '../../../../../lib/portalAccess'

const sanitizeFileName = (value: string) => {
  const safe = value.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return safe || 'signed-copy'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
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
    requiredScopes: 'DOWNLOADS_READ',
    required: !access.isAdmin,
  })
  if (!capability && !access.isAdmin) {
    return
  }

  const rawDocumentId = Array.isArray(req.query.documentId) ? req.query.documentId[0] : req.query.documentId
  let documentId = 0

  try {
    documentId = validateInteger(Number(rawDocumentId), 'documentId', { min: 1 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid documentId'
    return res.status(400).json({ message })
  }

  const target = await getContractDocumentById(documentId)
  if (!target || target.contract_id !== contract.contract_id) {
    return res.status(404).json({ message: 'Contract document not found.' })
  }

  if (target.signed_copy_object_key) {
    const safeFileName = `${sanitizeFileName(target.title)}.pdf`
    const download = await createSignedCopyDownloadUrl({
      objectKey: target.signed_copy_object_key,
      fileName: safeFileName,
    })

    const upstream = await fetch(download.url)
    if (!upstream.ok) {
      return res.status(502).json({ message: 'Signed copy is temporarily unavailable.' })
    }

    const contentType = upstream.headers.get('content-type') || 'application/pdf'
    const contentDisposition = `inline; filename="${safeFileName}"`
    const contentLength = upstream.headers.get('content-length')

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', contentDisposition)
    if (contentLength) {
      res.setHeader('Content-Length', contentLength)
    }

    const fileBuffer = Buffer.from(await upstream.arrayBuffer())
    return res.status(200).send(fileBuffer)
  }

  if (target.signed_copy_url) {
    return res.redirect(target.signed_copy_url)
  }

  return res.status(404).json({ message: 'Signed copy not found.' })
}
