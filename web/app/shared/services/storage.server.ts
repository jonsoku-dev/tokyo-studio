import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "ap-northeast-1";
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const isS3Configured =
	AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_BUCKET_NAME;

let s3Client: S3Client | null = null;

if (isS3Configured) {
	if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
		throw new Error("AWS credentials missing despite isS3Configured check.");
	}
	s3Client = new S3Client({
		region: AWS_REGION,
		credentials: {
			accessKeyId: AWS_ACCESS_KEY_ID,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
		},
	});
}

const STORAGE_TYPE =
	process.env.STORAGE_TYPE || (isS3Configured ? "s3" : "local");
const PRIVATE_STORAGE_DIR = path.join(process.cwd(), "storage/private");

// Ensure directory exists if local
if (STORAGE_TYPE === "local" && !fs.existsSync(PRIVATE_STORAGE_DIR)) {
	fs.mkdirSync(PRIVATE_STORAGE_DIR, { recursive: true });
}

export const storageService = {
	async getPresignedUrl(key: string, contentType: string) {
		if (!isS3Configured || !s3Client) {
			// Mock Mode or Error
			console.warn(
				"StorageService: AWS S3 Credentials missing. Using Mock Mode (returning fake URL).",
			);
			// In a real app, you might want to throw or return a local endpoint.
			// For now, we return a mock URL that wont really upload to S3 but allows UI testing.
			return {
				uploadUrl: `https://mock-upload.local/${key}`, // This will fail network call if used
				publicUrl: `https://mock-storage.local/${key}`,
				// Alternatively, we could implement a local file upload route and return that.
				// But for "Production Scope", let's assume valid keys or fail.
			};
		}

		const command = new PutObjectCommand({
			Bucket: AWS_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
			// ACL: "public-read", // Optional: depends on bucket policy
		});

		try {
			const uploadUrl = await getSignedUrl(s3Client, command, {
				expiresIn: 3600,
			});
			const publicUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
			return { uploadUrl, publicUrl };
		} catch (error) {
			console.error("StorageService Error:", error);
			throw error;
		}
	},

	/**
	 * Uploads a file to private storage (Local or S3 Private Bucket).
	 * Returns the key (path) to stored file.
	 */
	async uploadPrivateFile(
		fileStream: Readable | AsyncIterable<Uint8Array>,
		filename: string,
		contentType?: string,
	): Promise<string> {
		const uniqueKey = `${Date.now()}-${path.basename(filename)}`;

		if (STORAGE_TYPE === "local") {
			const filePath = path.join(PRIVATE_STORAGE_DIR, uniqueKey);
			const writable = fs.createWriteStream(filePath);

			// @ts-expect-error - native stream piping
			await finished(Readable.from(fileStream).pipe(writable));

			return uniqueKey;
		}

		if (isS3Configured && s3Client) {
			const command = new PutObjectCommand({
				Bucket: AWS_BUCKET_NAME,
				Key: `private/${uniqueKey}`,
				Body: fileStream as Readable, // S3 supports stream
				ContentType: contentType || "application/octet-stream",
				// No ACL -> Private by default
			});
			await s3Client.send(command);
			return `private/${uniqueKey}`;
		}

		throw new Error("Storage configuration error");
	},

	/**
	 * Gets a readable stream for a private file.
	 * Used for proxying secure file access.
	 */
	async getPrivateFileStream(key: string): Promise<Readable> {
		if (STORAGE_TYPE === "local") {
			const filePath = path.join(PRIVATE_STORAGE_DIR, key);
			if (!fs.existsSync(filePath)) {
				throw new Error("File not found");
			}
			return fs.createReadStream(filePath);
		}

		// For S3, we usually generate a Presigned GET URL instead of streaming through server,
		// but to satisfy the interface "getStream", we can use GetObject.
		// However, standard practice for private S3 files is Presigned URL.
		// Let's implement stream for now or throw.
		throw new Error(
			"S3 private stream not fully implemented - use Presigned URL strategy for S3",
		);
	},
};
