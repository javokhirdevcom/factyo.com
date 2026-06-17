import axios from 'axios'

export const SERVER_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'

export const axiosClient = axios.create({
	baseURL: SERVER_URL,
	withCredentials: true,
})

// Resolve error responses instead of throwing so next-safe-action always gets
// the { failure: '...' } body rather than "Something went wrong".
axiosClient.interceptors.response.use(
	response => response,
	error => {
		if (error.response) return Promise.resolve(error.response)
		return Promise.reject(error)
	},
)
