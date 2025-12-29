import { S3Client } from "@aws-sdk/client-s3";

/**
 * SPEC 006: AWS S3 Client Configuration
 *
 * Production-ready S3 client for file storage
 * Replaces local filesystem storage
 *
 * Environment Variables Required:
 * - AWS_REGION (default: ap-northeast-2)
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - S3_BUCKET_NAME (default: itcommunity-documents)
 */

// Validate required environment variables
const AWS_REGION = process.env.AWS_REGION || "ap-northeast-2";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "itcommunity-documents";

// Log configuration status (without exposing secrets)
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
	console.warn(
		"[S3] AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
	);
}

/**
 * S3 Client instance
 * Configured with credentials from environment variables
 */
export const s3Client = new S3Client({
	region: AWS_REGION,
	credentials:
		AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
			? {
					accessKeyId: AWS_ACCESS_KEY_ID,
					secretAccessKey: AWS_SECRET_ACCESS_KEY,
				}
			: undefined,
});

/**
 * S3 Bucket name
 * Used across all S3 operations
 */
export const S3_BUCKET = S3_BUCKET_NAME;

/**
 * S3 Configuration
 */
export const S3_CONFIG = {
	region: AWS_REGION,
	bucket: S3_BUCKET_NAME,
	/** Maximum file size: 10MB */
	maxFileSize: 10 * 1024 * 1024,
	/** Presigned URL expiration for uploads: 15 minutes */
	uploadUrlExpiration: 15 * 60,
	/** Presigned URL expiration for downloads: 1 hour */
	downloadUrlExpiration: 60 * 60,
	/** Allowed content types for documents */
	allowedContentTypes: [
		"application/pdf",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
		"text/plain",
	],
	/** Allowed content types for avatars */
	allowedAvatarTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * Helper function to generate S3 key for user documents
 * Pattern: users/{userId}/documents/{timestamp}-{filename}
 */
export function generateDocumentS3Key(
	userId: string,
	filename: string,
): string {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	return `users/${userId}/documents/${timestamp}-${sanitizedFilename}`;
}

/**
 * Helper function to generate S3 key for user avatars
 * Pattern: users/{userId}/avatars/{timestamp}-{size}.{ext}
 */
export function generateAvatarS3Key(
	userId: string,
	size: "original" | "800" | "200",
	extension: string = "jpg",
): string {
	const timestamp = Date.now();
	return `users/${userId}/avatars/${timestamp}-${size}.${extension}`;
}

/**
 * Helper function to generate S3 key for document thumbnails
 * Pattern: users/{userId}/documents/{documentId}-thumbnail.jpg
 */
export function generateThumbnailS3Key(
	userId: string,
	documentId: string,
): string {
	return `users/${userId}/documents/${documentId}-thumbnail.jpg`;
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
	return !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
}
