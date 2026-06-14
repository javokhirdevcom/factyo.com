'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { loginSchema, registerSchema, profileSchema } from '@/lib/validation'
import { z } from 'zod'

export const login = actionClient
	.schema(loginSchema)
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post('/api/auth/login', parsedInput)
		return JSON.parse(JSON.stringify(data))
	})

export const registerUser = actionClient
	.schema(registerSchema)
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post('/api/auth/register', {
			fullName: parsedInput.name,
			email: parsedInput.email,
			password: parsedInput.password,
		})
		return JSON.parse(JSON.stringify(data))
	})

export const sendOtpEmail = actionClient
	.schema(z.object({ email: z.string().email() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post('/api/otp/send', { email: parsedInput.email })
		return JSON.parse(JSON.stringify(data))
	})

export const verifyOtpCode = actionClient
	.schema(z.object({ email: z.string().email(), otp: z.string().length(6) }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.post('/api/otp/verify', {
			email: parsedInput.email,
			otp: parsedInput.otp,
		})
		if (!data.success) return { failure: data.message || 'Invalid code.' }

		// Mark user as verified in DB
		const activateRes = await axiosClient.post('/api/auth/verify-activate', { email: parsedInput.email })
		return JSON.parse(JSON.stringify(activateRes.data))
	})

export const updateProfileAction = actionClient
	.schema(profileSchema.extend({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { userId, ...rest } = parsedInput
		const { data } = await axiosClient.put(
			'/api/user/profile',
			rest,
			{ headers: { 'x-user-id': userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateAvatarAction = actionClient
	.schema(z.object({ userId: z.string(), avatarUrl: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			'/api/user/profile',
			{ avatarUrl: parsedInput.avatarUrl },
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateLogoAction = actionClient
	.schema(z.object({ userId: z.string(), logoUrl: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			'/api/user/profile',
			{ logoUrl: parsedInput.logoUrl },
			{ headers: { 'x-user-id': parsedInput.userId } }
		)
		return JSON.parse(JSON.stringify(data))
	})
