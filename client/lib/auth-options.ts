import { axiosClient } from '@/http/axios'
import { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'

export const authOptions: NextAuthOptions = {
	providers: [
		Credentials({
			name: 'Credentials',
			credentials: { userId: { label: 'User Id', type: 'text' } },
			async authorize(credentials) {
				const { data } = await axiosClient.get(`/api/user/profile/${credentials?.userId}`)
				if (!data?.user) return null
				return {
					id: data.user._id,
					email: data.user.email,
					name: data.user.fullName,
					role: data.user.role,
					plan: data.user.plan,
					invoiceCount: data.user.invoiceCount,
				}
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		AppleProvider({
			clientId: process.env.APPLE_ID!,
			clientSecret: process.env.APPLE_SECRET!,
		}),
	],
	callbacks: {
		async jwt({ token, user, account, profile }) {
			if (user) {
				token.id = user.id
				token.role = (user as any).role
				token.plan = (user as any).plan
				token.invoiceCount = (user as any).invoiceCount
			}
			if (account && (account.provider === 'google' || account.provider === 'apple') && profile) {
				try {
					const { data } = await axiosClient.post('/api/auth/oauth-signin', {
						email: profile.email,
						name: (profile as any).name || (profile as any).given_name || '',
						provider: account.provider,
					})
					if (data?.user) {
						token.id = data.user._id
						token.role = data.user.role
						token.plan = data.user.plan
						token.invoiceCount = data.user.invoiceCount
					}
				} catch {
					// oauth backend sync failed — token still valid
				}
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as string
			}
			try {
				const { data } = await axiosClient.get(`/api/user/profile/${token.id}`)
				session.currentUser = data.user
			} catch {
				// profile fetch failed — session still valid
			}
			return session
		},
	},
	pages: {
		signIn: '/login',
	},
	session: { strategy: 'jwt' },
	secret: process.env.NEXTAUTH_SECRET,
}
