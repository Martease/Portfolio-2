import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        // Demo: replace with real user lookup or integrate Clerk
        const allowed = [
          { id: 'CTR-001', email: 'client@example.com', name: 'District 221' }
        ]
        const user = allowed.find(u => u.email === credentials?.email)
        if (user && credentials?.password === 'secret') {
          return { id: user.id, name: user.name, email: user.email }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret',
  session: { strategy: 'jwt' },
  pages: { signIn: '/api/auth/signin' }
})
