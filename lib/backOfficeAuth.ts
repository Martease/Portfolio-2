import crypto from 'crypto'

export const BACK_OFFICE_COOKIE_NAME = 'back_office_auth'

const resolveSigningSecret = () => {
  return process.env.BACK_OFFICE_SECRET || process.env.NEXTAUTH_SECRET || 'local-dev-back-office-secret'
}

const getRequiredPasscode = () => {
  return process.env.BACK_OFFICE_PASSCODE || 'mamvo-back-office'
}

export const createBackOfficeToken = () => {
  return crypto.createHmac('sha256', resolveSigningSecret()).update(getRequiredPasscode()).digest('hex')
}

export const isValidBackOfficePasscode = (passcode: string) => {
  return passcode === getRequiredPasscode()
}

export const isBackOfficeAuthenticated = (req: { cookies?: Partial<Record<string, string>> }) => {
  const cookieToken = req.cookies?.[BACK_OFFICE_COOKIE_NAME]
  if (!cookieToken) return false
  return cookieToken === createBackOfficeToken()
}