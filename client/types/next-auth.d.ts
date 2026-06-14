import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			role?: string
		} & DefaultSession['user']
		currentUser?: any
	}

	interface User {
		id: string
		role?: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		role?: string
	}
}
