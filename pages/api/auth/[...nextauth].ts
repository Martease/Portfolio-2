import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticateUser } from '../../../lib/userStore'

const SHORT_SESSION_MAX_AGE = 60 * 60 * 24
const LONG_SESSION_MAX_AGE = 60 * 60 * 24 * 30
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!nextAuthSecret && process.env.NODE_ENV === 'production') {
  console.warn('NEXTAUTH_SECRET is not set; using development fallback secret. Set NEXTAUTH_SECRET for secure production sessions.')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const authResult = await authenticateUser(credentials.email, credentials.password)
        if (!authResult.ok) {
          if (authResult.reason === 'account_locked') {
            throw new Error('Account locked. Please try again later.')
          }

          if (authResult.reason === 'email_unverified') {
            throw new Error('Please verify your email before logging in.')
          }

          return null
        }

        const user = authResult.user

        const rememberMe = credentials.rememberMe === 'true'
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          contractId: user.contract_id || undefined,
          rememberMe,
        }
      },
    }),
  ],
  secret: nextAuthSecret || 'dev-secret',
  session: {
    strategy: 'jwt',
    maxAge: LONG_SESSION_MAX_AGE,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const rememberMe = Boolean((user as { rememberMe?: boolean }).rememberMe)
        const maxAge = rememberMe ? LONG_SESSION_MAX_AGE : SHORT_SESSION_MAX_AGE

        token.id = user.id
        token.role = (user as { role?: 'admin' | 'client' }).role
        token.contractId = (user as { contractId?: string }).contractId
        token.rememberMe = rememberMe
        token.maxAge = maxAge
        token.exp = Math.floor(Date.now() / 1000) + maxAge
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.contractId = token.contractId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

export default NextAuth(authOptions)
