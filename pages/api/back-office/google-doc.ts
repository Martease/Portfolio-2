import type { NextApiRequest, NextApiResponse } from 'next'
import { getContract } from '../../../lib/contractStore'
import { deny, getApiSession, hasRole } from '../../../lib/authz'
import { createContractDocFromTemplate } from '../../../lib/googleWorkspace'
import { findClientEmailByContractId } from '../../../lib/userStore'

type GoogleDocResponse = {
  message: string
  docUrl?: string
  setup?: {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string
    GOOGLE_DOCS_TEMPLATE_ID: string
    GOOGLE_DRIVE_FOLDER_ID: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GoogleDocResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = await getApiSession(req, res)
  if (!session?.user) {
    return deny(res, 401, 'Authentication required')
  }

  if (!hasRole(session.user.role, ['admin'])) {
    return deny(res, 403, 'Admin role required')
  }

  const contractId = String(req.body?.contractId || '')
  if (!contractId) {
    return res.status(400).json({ message: 'contractId is required' })
  }

  const contract = await getContract(contractId)
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' })
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const templateId = process.env.GOOGLE_DOCS_TEMPLATE_ID
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!serviceAccountEmail || !serviceAccountPrivateKey || !templateId || !folderId) {
    return res.status(200).json({
      message: `Google Docs setup placeholder is active for ${contract.contract_id}. Add your Google env vars, then replace this route's TODO with googleapis calls.`,
      setup: {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: 'your-service-account@project.iam.gserviceaccount.com',
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n',
        GOOGLE_DOCS_TEMPLATE_ID: '1AbCdEfTemplateDocId',
        GOOGLE_DRIVE_FOLDER_ID: '1XyZFolderId',
      },
    })
  }

  const generated = await createContractDocFromTemplate({
    contractId: contract.contract_id,
    clientName: contract.client_name,
    templateId,
    targetFolderId: folderId,
    clientEmail: await findClientEmailByContractId(contract.contract_id),
  })

  const docUrl = generated?.docUrl || `https://docs.google.com/document/d/${templateId}/edit`

  return res.status(200).json({
    message: `Google Docs document prepared for ${contract.contract_id}.`,
    docUrl,
  })
}