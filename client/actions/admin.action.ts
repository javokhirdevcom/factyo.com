'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const h = (userId: string) => ({ 'x-user-id': userId })

export const getAdminStatsAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/admin/stats', { headers: h(parsedInput.userId) })
		return JSON.parse(JSON.stringify(data))
	})

export const getAdminRevenueAction = actionClient
	.schema(z.object({ userId: z.string(), months: z.number().optional() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get(
			`/api/admin/revenue?months=${parsedInput.months ?? 12}`,
			{ headers: h(parsedInput.userId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const getAdminUsersAction = actionClient
	.schema(z.object({
		userId: z.string(),
		search: z.string().optional(),
		page: z.number().optional(),
		plan: z.string().optional(),
		status: z.string().optional(),
	}))
	.action(async ({ parsedInput }) => {
		const { userId, search = '', page = 1, plan = '', status = '' } = parsedInput
		const params = new URLSearchParams({ search, page: String(page) })
		if (plan) params.set('plan', plan)
		if (status) params.set('status', status)
		const { data } = await axiosClient.get(`/api/admin/users?${params}`, { headers: h(userId) })
		return JSON.parse(JSON.stringify(data))
	})

export const getUserDetailAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get(
			`/api/admin/users/${parsedInput.targetUserId}`,
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const verifyUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/verify`,
			{},
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const unverifyUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/unverify`,
			{},
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const banUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/ban`,
			{},
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const unbanUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/unban`,
			{},
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateUserRoleAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string(), role: z.enum(['user', 'admin']) }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/role`,
			{ role: parsedInput.role },
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const updateUserPlanAction = actionClient
	.schema(z.object({
		adminId: z.string(),
		targetUserId: z.string(),
		plan: z.enum(['free', 'basic', 'unlimited']),
	}))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/plan`,
			{ plan: parsedInput.plan },
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const cancelUserSubscriptionAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.put(
			`/api/admin/users/${parsedInput.targetUserId}/cancel-subscription`,
			{},
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const deleteUserAction = actionClient
	.schema(z.object({ adminId: z.string(), targetUserId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.delete(
			`/api/admin/users/${parsedInput.targetUserId}`,
			{ headers: h(parsedInput.adminId) },
		)
		return JSON.parse(JSON.stringify(data))
	})

export const getAdminSettingsAction = actionClient
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/admin/settings', { headers: h(parsedInput.userId) })
		return JSON.parse(JSON.stringify(data))
	})

export const updateAdminSettingsAction = actionClient
	.schema(z.object({
		userId: z.string(),
		otpEnabled: z.boolean().optional(),
		maintenanceMode: z.boolean().optional(),
	}))
	.action(async ({ parsedInput }) => {
		const { userId, ...settings } = parsedInput
		const { data } = await axiosClient.put('/api/admin/settings', settings, { headers: h(userId) })
		return JSON.parse(JSON.stringify(data))
	})
