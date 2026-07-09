import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		user?: {
			id?: string
			role?: 'admin' | 'client'
			contractId?: string
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id?: string
		role?: 'admin' | 'client'
		contractId?: string
		rememberMe?: boolean
		maxAge?: number
	}
}
