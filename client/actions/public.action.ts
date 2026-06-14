'use server'

import { axiosClient } from '@/http/axios'
import { actionClient } from '@/lib/safe-action'

export const getPublicProducts = actionClient.action(async () => {
	// ESKI NOTO'G'RI MANZIL (Buni o'chiring):
	// const { data } = await axiosClient.get('/api/admin/products')

	// YANGI TO'G'RI MANZIL (Postmandagi kabi):
	const { data } = await axiosClient.get('/api/user/products')

	return JSON.parse(JSON.stringify(data))
})
