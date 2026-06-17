'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const adminHeaders = (userId: string) => ({ 'x-user-id': userId })

export const getAdminStatsAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/admin/stats', {
			headers: adminHeaders(parsedInput.userId),
		})
		return JSON.parse(JSON.stringify(data))
	})

export const getAdminUsersAction = actionClient
	.schema(z.object({ userId: z.string(), search: z.string().optional(), page: z.number().optional() }))
	.action(async ({ parsedInput }) => {
		const { userId, search = '', page = 1 } = parsedInput
		const { data } = await axiosClient.get(`/api/admin/users?search=${search}&page=${page}`, {
			headers: adminHeaders(userId),
		})
		return JSON.parse(JSON.stringify(data))
	})

export const verifyUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/verify`,
			{},
			{ headers: adminHeaders(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const unverifyUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/unverify`,
			{},
			{ headers: adminHeaders(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateUserRoleAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string(), role: z.enum(['user', 'admin']) }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/role`,
			{ role: parsedInput.role },
			{ headers: adminHeaders(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const deleteUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.delete(
			`/api/admin/users/${parsedInput.targetUserId}`,
			{ headers: adminHeaders(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const getAdminSettingsAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/admin/settings', {
			headers: adminHeaders(parsedInput.userId),
		})
		return JSON.parse(JSON.stringify(data))
	})

export const updateAdminSettingsAction = actionClient
	.schema(z.object({ userId: z.string(), otpEnabled: z.boolean() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			'/api/admin/settings',
			{ otpEnabled: parsedInput.otpEnabled },
			{ headers: adminHeaders(parsedInput.userId) },
		)
		return JSON.parse(JSON.stringify(data))
	})
