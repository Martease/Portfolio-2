type WorkspaceResource = {
  resourceName: string
  resourceType: 'drive_folder' | 'google_doc'
  resourceId: string
  resourceUrl: string
}

type GoogleClients = {
  drive: any
  docs: any
}

const FOLDER_NAMES = [
  'Client',
  'Contracts',
  'Content',
  'Branding',
  'Images',
  'Research',
  'Meeting Notes',
  'Deliverables',
  'Archive',
]

const ensureGoogleConfig = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!email || !privateKey || !rootFolderId) {
    return null
  }

  return {
    email,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    rootFolderId,
  }
}

const getGoogleClients = async (): Promise<GoogleClients | null> => {
  const config = ensureGoogleConfig()
  if (!config) return null

  // Use require to avoid hard TS dependency when package is not installed yet.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { google } = require('googleapis')

  const auth = new google.auth.JWT({
    email: config.email,
    key: config.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
    ],
  })

  await auth.authorize()

  return {
    drive: google.drive({ version: 'v3', auth }),
    docs: google.docs({ version: 'v1', auth }),
  }
}

const safeName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, ' ').trim()

/**
 * Escapes special characters in Google Drive query strings
 * Google Drive uses single quotes and backslashes as escape characters
 */
const escapeGoogleDriveQuery = (value: string): string => {
  // Escape backslashes first, then single quotes
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const findFolder = async (drive: any, parentId: string, name: string) => {
  const escapedName = escapeGoogleDriveQuery(name)
  const escapedParentId = escapeGoogleDriveQuery(parentId)
  
  const result = await drive.files.list({
    q: `name = '${escapedName}' and '${escapedParentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 1,
  })

  return result.data.files?.[0] || null
}

const ensureFolder = async (drive: any, parentId: string, name: string) => {
  const existing = await findFolder(drive, parentId, name)
  if (existing?.id) return existing.id as string

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })

  return String(created.data.id)
}

const shareFileWithClient = async (drive: any, fileId: string, email?: string) => {
  if (!email) return

  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: email,
      },
      sendNotificationEmail: false,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to share Google file with client:', errorMessage)
  }
}

export const canUseGoogleWorkspace = () => {
  return Boolean(ensureGoogleConfig())
}

export const provisionGoogleWorkspace = async (params: {
  contractId: string
  clientName: string
  clientEmail?: string
}) => {
  const config = ensureGoogleConfig()
  if (!config) return null

  const clients = await getGoogleClients()
  if (!clients) return null

  const { drive, docs } = clients

  const clientRootName = safeName(`${params.clientName} - ${params.contractId}`)
  const clientRootId = await ensureFolder(drive, config.rootFolderId, clientRootName)

  const resources: WorkspaceResource[] = []
  const folderIdByName = new Map<string, string>()

  for (const folderName of FOLDER_NAMES) {
    const folderId = await ensureFolder(drive, clientRootId, folderName)
    folderIdByName.set(folderName, folderId)
    await shareFileWithClient(drive, folderId, params.clientEmail)

    resources.push({
      resourceName: folderName,
      resourceType: 'drive_folder',
      resourceId: folderId,
      resourceUrl: `https://drive.google.com/drive/folders/${folderId}`,
    })
  }

  const docTitle = safeName(`${params.contractId} Shared Project Doc`)
  const sharedDoc = await docs.documents.create({
    requestBody: {
      title: docTitle,
    },
  })

  const docId = String(sharedDoc.data.documentId)
  const meetingNotesFolderId = folderIdByName.get('Meeting Notes')

  if (meetingNotesFolderId) {
    await drive.files.update({
      fileId: docId,
      addParents: meetingNotesFolderId,
      removeParents: 'root',
      fields: 'id, parents',
    }).catch(() => undefined)
  }

  await shareFileWithClient(drive, docId, params.clientEmail)

  resources.push({
    resourceName: 'Shared Project Doc',
    resourceType: 'google_doc',
    resourceId: docId,
    resourceUrl: `https://docs.google.com/document/d/${docId}/edit`,
  })

  return resources
}

export const createContractDocFromTemplate = async (params: {
  contractId: string
  clientName: string
  templateId: string
  targetFolderId: string
  clientEmail?: string
}) => {
  const clients = await getGoogleClients()
  if (!clients) return null

  const { drive } = clients
  const fileName = safeName(`${params.contractId} - ${params.clientName} Contract`)

  const copied = await drive.files.copy({
    fileId: params.templateId,
    requestBody: {
      name: fileName,
      parents: [params.targetFolderId],
    },
    fields: 'id',
  })

  const docId = String(copied.data.id)
  await shareFileWithClient(drive, docId, params.clientEmail)

  return {
    docId,
    docUrl: `https://docs.google.com/document/d/${docId}/edit`,
  }
}

export type { WorkspaceResource }