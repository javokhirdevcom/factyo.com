import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
	imageUploader: f({
		image: { maxFileSize: '4MB', maxFileCount: 1 },
	}).onUploadComplete(async ({ file }) => {
		return { url: file.url, key: file.key }
	}),
	avatarUploader: f({
		image: { maxFileSize: '2MB', maxFileCount: 1 },
	}).onUploadComplete(async ({ file }) => {
		return { url: file.url, key: file.key }
	}),
	logoUploader: f({
		image: { maxFileSize: '4MB', maxFileCount: 1 },
	}).onUploadComplete(async ({ file }) => {
		return { url: file.url, key: file.key }
	}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
