declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg'
declare module '*.webp'

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		user?: {
			id?: string
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id?: string
	}
}
