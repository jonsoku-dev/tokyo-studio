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
};
