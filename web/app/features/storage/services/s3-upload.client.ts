/**
 * SPEC 006: Client-Side S3 Upload Service
 *
 * Handles direct upload to S3 using presigned URLs
 *
 * Flow:
 * 1. Request presigned URL from server
 * 2. Upload file directly to S3
 * 3. Confirm upload with server
 *
 * Features:
 * - Progress tracking
 * - Error handling
 * - Upload cancellation
 */

export interface UploadProgress {
	loaded: number;
	total: number;
	percentage: number;
}

export interface UploadOptions {
	onProgress?: (progress: UploadProgress) => void;
	signal?: AbortSignal;
}

export interface UploadResult {
	success: boolean;
	documentId: string;
	message?: string;
	error?: string;
}

/**
 * Upload a file directly to S3
 *
 * @param file - File to upload
 * @param documentType - Type of document (Resume, CV, Portfolio, Cover Letter)
 * @param options - Upload options (progress tracking, cancellation)
 * @returns Upload result with document ID
 *
 * @example
 * const result = await uploadFileToS3(file, "Resume", {
 *   onProgress: (progress) => {
 *     console.log(`Uploaded ${progress.percentage}%`);
 *   }
 * });
 */
export async function uploadFileToS3(
	file: File,
	documentType: string,
	options: UploadOptions = {},
): Promise<UploadResult> {
	const { onProgress, signal } = options;

	try {
		// Step 1: Request presigned upload URL from server
		const response = await fetch("/api/storage/upload", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				filename: file.name,
				contentType: file.type,
				fileSize: file.size,
				documentType,
			}),
			signal,
		});

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				documentId: "",
				error: error.error || "Failed to get upload URL",
			};
		}

		const { uploadUrl, documentId }: { uploadUrl: string; documentId: string } =
			await response.json();

		// Step 2: Upload file directly to S3 using presigned URL
		await uploadToS3WithProgress(uploadUrl, file, {
			onProgress,
			signal,
			contentType: file.type,
		});

		// Step 3: Confirm upload with server
		const confirmResponse = await fetch("/api/storage/confirm", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ documentId }),
			signal,
		});

		if (!confirmResponse.ok) {
			const error = await confirmResponse.json();
			return {
				success: false,
				documentId,
				error: error.error || "Failed to confirm upload",
			};
		}

		return {
			success: true,
			documentId,
			message: "Upload successful",
		};
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				return {
					success: false,
					documentId: "",
					error: "Upload cancelled",
				};
			}
			return {
				success: false,
				documentId: "",
				error: error.message,
			};
		}
		return {
			success: false,
			documentId: "",
			error: "Unknown error occurred",
		};
	}
}

/**
 * Upload file to S3 with progress tracking
 */
async function uploadToS3WithProgress(
	uploadUrl: string,
	file: File,
	options: {
		onProgress?: (progress: UploadProgress) => void;
		signal?: AbortSignal;
		contentType: string;
	},
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		// Track upload progress
		if (options.onProgress) {
			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					options.onProgress?.({
						loaded: e.loaded,
						total: e.total,
						percentage: Math.round((e.loaded / e.total) * 100),
					});
				}
			});
		}

		// Handle completion
		xhr.addEventListener("load", () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`Upload failed with status ${xhr.status}`));
			}
		});

		// Handle errors
		xhr.addEventListener("error", () => {
			reject(new Error("Upload failed"));
		});

		// Handle abort
		xhr.addEventListener("abort", () => {
			reject(new Error("Upload cancelled"));
		});

		// Wire up abort signal
		if (options.signal) {
			options.signal.addEventListener("abort", () => {
				xhr.abort();
			});
		}

		// Send request
		xhr.open("PUT", uploadUrl);
		xhr.setRequestHeader("Content-Type", options.contentType);
		xhr.send(file);
	});
}

/**
 * Get download URL for a document
 *
 * @param documentId - Document ID
 * @returns Download URL
 */
export async function getDownloadUrl(
	documentId: string,
): Promise<string | null> {
	try {
		const response = await fetch(`/api/storage/download/${documentId}`);

		if (!response.ok) {
			console.error("Failed to get download URL");
			return null;
		}

		const data = await response.json();
		return data.downloadUrl;
	} catch (error) {
		console.error("Error getting download URL:", error);
		return null;
	}
}

/**
 * Download a document (opens in new tab or triggers download)
 *
 * @param documentId - Document ID
 */
export async function downloadDocument(documentId: string): Promise<void> {
	// Use redirect mode to directly download
	window.open(`/api/storage/download/${documentId}?redirect=true`, "_blank");
}
