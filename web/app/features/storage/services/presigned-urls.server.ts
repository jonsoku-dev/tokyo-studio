import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	generateDocumentS3Key,
	S3_BUCKET,
	S3_CONFIG,
	s3Client,
} from "~/shared/services/s3-client.server";

/**
 * SPEC 006: Presigned URL Generation Service
 *
 * Generates secure, time-limited URLs for direct client-to-S3 operations
 * - Upload: Client uploads directly to S3 using presigned PUT URL
 * - Download: Client downloads directly from S3 using presigned GET URL
 */

export interface UploadPresignedUrlResult {
	/** Presigned URL for direct upload to S3 */
	uploadUrl: string;
	/** S3 key where file will be stored */
	key: string;
	/** Expiration time in seconds */
	expiresIn: number;
}

export interface DownloadPresignedUrlResult {
	/** Presigned URL for direct download from S3 */
	downloadUrl: string;
	/** Expiration time in seconds */
	expiresIn: number;
}

/**
 * Generate presigned URL for uploading a document to S3
 *
 * @param userId - User ID for organizing files
 * @param filename - Original filename
 * @param contentType - MIME type of the file
 * @returns Presigned upload URL and S3 key
 *
 * @example
 * const result = await generateUploadPresignedUrl({
 *   userId: "user-123",
 *   filename: "resume.pdf",
 *   contentType: "application/pdf"
 * });
 * // Client uploads directly to result.uploadUrl
 */
export async function generateUploadPresignedUrl({
	userId,
	filename,
	contentType,
}: {
	userId: string;
	filename: string;
	contentType: string;
}): Promise<UploadPresignedUrlResult> {
	// Validate content type
	const allowedTypes = S3_CONFIG.allowedContentTypes as readonly string[];
	if (!allowedTypes.includes(contentType)) {
		throw new Error(
			`Invalid content type: ${contentType}. Allowed types: ${allowedTypes.join(", ")}`,
		);
	}

	// Generate S3 key
	const key = generateDocumentS3Key(userId, filename);

	// Create PutObject command
	const command = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		ContentType: contentType,
		// Optional: Add metadata
		Metadata: {
			uploadedBy: userId,
			originalFilename: filename,
		},
	});

	// Generate presigned URL
	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: S3_CONFIG.uploadUrlExpiration,
	});

	return {
		uploadUrl,
		key,
		expiresIn: S3_CONFIG.uploadUrlExpiration,
	};
}

/**
 * Generate presigned URL for downloading a document from S3
 *
 * @param key - S3 key of the file
 * @param filename - Optional custom filename for download
 * @returns Presigned download URL
 *
 * @example
 * const result = await generateDownloadPresignedUrl(
 *   "users/user-123/documents/1234567890-resume.pdf",
 *   "My_Resume.pdf"
 * );
 * // Client downloads from result.downloadUrl
 */
export async function generateDownloadPresignedUrl(
	key: string,
	filename?: string,
): Promise<DownloadPresignedUrlResult> {
	// Create GetObject command
	const command = new GetObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		// Optional: Set custom filename for download
		ResponseContentDisposition: filename
			? `attachment; filename="${filename}"`
			: undefined,
	});

	// Generate presigned URL
	const downloadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: S3_CONFIG.downloadUrlExpiration,
	});

	return {
		downloadUrl,
		expiresIn: S3_CONFIG.downloadUrlExpiration,
	};
}

/**
 * Delete a file from S3
 *
 * @param key - S3 key of the file to delete
 *
 * @example
 * await deleteFromS3("users/user-123/documents/1234567890-resume.pdf");
 */
export async function deleteFromS3(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
	});

	await s3Client.send(command);
}

/**
 * Generate presigned URL for avatar upload
 *
 * @param userId - User ID
 * @param contentType - Image MIME type
 * @returns Presigned upload URL and S3 key
 */
export async function generateAvatarUploadPresignedUrl({
	userId,
	contentType,
}: {
	userId: string;
	contentType: string;
}): Promise<UploadPresignedUrlResult> {
	// Validate content type
	const allowedTypes = S3_CONFIG.allowedAvatarTypes as readonly string[];
	if (!allowedTypes.includes(contentType)) {
		throw new Error(
			`Invalid avatar content type: ${contentType}. Allowed types: ${allowedTypes.join(", ")}`,
		);
	}

	// Generate S3 key for original avatar
	const extension = contentType.split("/")[1] || "jpg";
	const key = `users/${userId}/avatars/${Date.now()}-original.${extension}`;

	const command = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		ContentType: contentType,
		Metadata: {
			uploadedBy: userId,
		},
	});

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: S3_CONFIG.uploadUrlExpiration,
	});

	return {
		uploadUrl,
		key,
		expiresIn: S3_CONFIG.uploadUrlExpiration,
	};
}
