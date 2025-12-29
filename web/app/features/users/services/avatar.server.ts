import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { deleteFromS3 } from "~/features/storage/services/presigned-urls.server";
import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { S3_BUCKET, s3Client } from "~/shared/services/s3-client.server";

/**
 * SPEC 004: Avatar Upload with S3 Storage
 *
 * Features:
 * - S3-based storage (not local filesystem)
 * - Dual-size generation: 800x800 (full) + 200x200 (thumbnail)
 * - WebP format for optimal compression
 * - Automatic old avatar cleanup
 */

interface AvatarSizes {
	avatarUrl: string;
	avatarThumbnailUrl: string;
}

/**
 * Generate both 800x800 and 200x200 avatar sizes
 * Automatically strips EXIF metadata for privacy
 */
async function generateAvatarSizes(buffer: Buffer): Promise<{
	large: Buffer;
	thumbnail: Buffer;
}> {
	// Validate image format
	const metadata = await sharp(buffer).metadata();
	if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
		throw new Error(
			"Invalid image format. Only JPG, PNG, and WebP are allowed.",
		);
	}

	// First, strip all EXIF metadata from the original
	const cleanedBuffer = await sharp(buffer)
		.rotate() // Auto-rotate based on EXIF orientation (then strips EXIF)
		.withMetadata(false) // Explicitly remove all metadata
		.webp() // Convert to WebP (removing any format-specific metadata)
		.toBuffer();

	// Generate both sizes in parallel from cleaned buffer
	const [large, thumbnail] = await Promise.all([
		// 800x800 for profile pages
		sharp(cleanedBuffer)
			.resize(800, 800, {
				fit: "cover",
				position: "center",
			})
			.webp({ quality: 90 })
			.toBuffer(),

		// 200x200 for thumbnails in lists/comments
		sharp(cleanedBuffer)
			.resize(200, 200, {
				fit: "cover",
				position: "center",
			})
			.webp({ quality: 85 })
			.toBuffer(),
	]);

	return { large, thumbnail };
}

/**
 * Upload buffer to S3
 */
async function uploadToS3(
	key: string,
	buffer: Buffer,
	contentType: string,
): Promise<void> {
	const command = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		Body: buffer,
		ContentType: contentType,
	});

	await s3Client.send(command);
}

/**
 * Extract S3 key from CloudFront/S3 URL
 */
function extractS3Key(url: string): string | null {
	// Handle CloudFront URLs: https://xxx.cloudfront.net/users/...
	// Handle S3 URLs: https://bucket.s3.region.amazonaws.com/users/...
	const match = url.match(/users\/[\w-]+\/avatars\/[\w-]+\.webp/);
	return match ? match[0] : null;
}

export const avatarService = {
	async uploadAvatar(userId: string, buffer: Buffer): Promise<AvatarSizes> {
		// Generate both sizes
		const { large, thumbnail } = await generateAvatarSizes(buffer);

		// Generate S3 keys
		const timestamp = Date.now();
		const largeKey = `users/${userId}/avatars/${timestamp}-800.webp`;
		const thumbnailKey = `users/${userId}/avatars/${timestamp}-200.webp`;

		// Upload both to S3 in parallel
		await Promise.all([
			uploadToS3(largeKey, large, "image/webp"),
			uploadToS3(thumbnailKey, thumbnail, "image/webp"),
		]);

		// Construct CloudFront URLs (or S3 URLs if no CloudFront)
		const baseUrl =
			process.env.CLOUDFRONT_URL || `https://${S3_BUCKET}.s3.amazonaws.com`;
		const avatarUrl = `${baseUrl}/${largeKey}`;
		const avatarThumbnailUrl = `${baseUrl}/${thumbnailKey}`;

		// Get old avatars for cleanup
		const [currentUser] = await db
			.select({
				avatarUrl: users.avatarUrl,
				avatarThumbnailUrl: users.avatarThumbnailUrl,
			})
			.from(users)
			.where(eq(users.id, userId));

		// Delete old avatars from S3
		if (currentUser?.avatarUrl) {
			const oldKey = extractS3Key(currentUser.avatarUrl);
			if (oldKey) {
				try {
					await deleteFromS3(oldKey);
				} catch (e) {
					console.warn("Failed to delete old avatar:", e);
				}
			}
		}

		if (currentUser?.avatarThumbnailUrl) {
			const oldThumbnailKey = extractS3Key(currentUser.avatarThumbnailUrl);
			if (oldThumbnailKey) {
				try {
					await deleteFromS3(oldThumbnailKey);
				} catch (e) {
					console.warn("Failed to delete old avatar thumbnail:", e);
				}
			}
		}

		// Update database with both URLs
		await db
			.update(users)
			.set({ avatarUrl, avatarThumbnailUrl })
			.where(eq(users.id, userId));

		return { avatarUrl, avatarThumbnailUrl };
	},

	async deleteAvatar(
		userId: string,
	): Promise<{ avatarUrl?: string | null; avatarThumbnailUrl?: string | null }> {
		const [currentUser] = await db
			.select({
				avatarUrl: users.avatarUrl,
				avatarThumbnailUrl: users.avatarThumbnailUrl,
			})
			.from(users)
			.where(eq(users.id, userId));

		// Delete from S3
		if (currentUser?.avatarUrl) {
			const key = extractS3Key(currentUser.avatarUrl);
			if (key) {
				try {
					await deleteFromS3(key);
				} catch (e) {
					console.warn("Failed to delete avatar from S3:", e);
				}
			}
		}

		if (currentUser?.avatarThumbnailUrl) {
			const thumbnailKey = extractS3Key(currentUser.avatarThumbnailUrl);
			if (thumbnailKey) {
				try {
					await deleteFromS3(thumbnailKey);
				} catch (e) {
					console.warn("Failed to delete avatar thumbnail from S3:", e);
				}
			}
		}

		// Clear database references
		await db
			.update(users)
			.set({ avatarUrl: null, avatarThumbnailUrl: null })
			.where(eq(users.id, userId));

		// Return previous URL for audit logging
		return currentUser || {};
	},
};
