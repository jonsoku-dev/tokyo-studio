/**
 * SPEC 007: Enhanced Error Messages for Document Upload
 *
 * Detailed error types and messages for better user experience
 */

export enum UploadErrorType {
	QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
	INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
	FILE_TOO_LARGE = "FILE_TOO_LARGE",
	NETWORK_ERROR = "NETWORK_ERROR",
	SERVER_ERROR = "SERVER_ERROR",
	UNKNOWN = "UNKNOWN",
}

export interface UploadError {
	type: UploadErrorType;
	message: string;
	details?: string;
	code?: string;
	currentUsage?: number;
	maxQuota?: number;
	remainingQuota?: number;
	maxSize?: number;
}

/**
 * Get user-friendly error message based on error type
 */
export function getUploadErrorMessage(error: UploadError): string {
	switch (error.type) {
		case UploadErrorType.QUOTA_EXCEEDED:
			return `Storage quota exceeded. You've used ${formatBytes(error.currentUsage || 0)} of ${formatBytes(error.maxQuota || 100 * 1024 * 1024)}. Please delete some files to free up space.`;

		case UploadErrorType.INVALID_FILE_TYPE:
			return `Invalid file type. Only PDF, DOCX, and TXT files are supported. ${error.details || ""}`;

		case UploadErrorType.FILE_TOO_LARGE:
			return `File is too large (maximum ${formatBytes(error.maxSize || 10 * 1024 * 1024)}). ${error.details || ""}`;

		case UploadErrorType.NETWORK_ERROR:
			return "Network error. Please check your internet connection and try again.";

		case UploadErrorType.SERVER_ERROR:
			return `Server error: ${error.message}. Please try again later.`;

		default:
			return error.message || "An unexpected error occurred. Please try again.";
	}
}

/**
 * Get actionable suggestions based on error type
 */
export function getUploadErrorSuggestions(error: UploadError): string | null {
	switch (error.type) {
		case UploadErrorType.QUOTA_EXCEEDED:
			return "Delete old documents or contact support to upgrade your storage quota.";

		case UploadErrorType.FILE_TOO_LARGE:
			return "Try compressing your file or splitting it into smaller parts. You can use online PDF compressors.";

		case UploadErrorType.INVALID_FILE_TYPE:
			return "Convert your file to PDF, DOCX, or TXT format before uploading.";

		case UploadErrorType.NETWORK_ERROR:
			return "Check your internet connection and try again. If the problem persists, try a smaller file.";

		default:
			return null;
	}
}

/**
 * Parse error response from server API
 */
export function parseUploadError(
	err: unknown,
	responseData?: { error?: string; code?: string; [key: string]: unknown },
): UploadError {
	// Network error
	if (
		err instanceof TypeError &&
		(err.message.includes("fetch") || err.message.includes("network"))
	) {
		return {
			type: UploadErrorType.NETWORK_ERROR,
			message: "Network error",
		};
	}

	// Server error with code
	if (responseData?.code) {
		switch (responseData.code) {
			case "QUOTA_EXCEEDED":
				return {
					type: UploadErrorType.QUOTA_EXCEEDED,
					message: responseData.error || "Storage quota exceeded",
					code: responseData.code,
					currentUsage: responseData.currentUsage as number | undefined,
					maxQuota: responseData.maxQuota as number | undefined,
					remainingQuota: responseData.remainingQuota as number | undefined,
				};

			case "INVALID_FILE_TYPE":
				return {
					type: UploadErrorType.INVALID_FILE_TYPE,
					message: responseData.error || "Invalid file type",
					code: responseData.code,
				};

			case "FILE_TOO_LARGE":
				return {
					type: UploadErrorType.FILE_TOO_LARGE,
					message: responseData.error || "File too large",
					code: responseData.code,
					maxSize: responseData.maxSize as number | undefined,
				};

			default:
				return {
					type: UploadErrorType.SERVER_ERROR,
					message: responseData.error || "Server error",
					code: responseData.code,
				};
		}
	}

	// Generic error
	if (err instanceof Error) {
		return {
			type: UploadErrorType.UNKNOWN,
			message: err.message,
		};
	}

	return {
		type: UploadErrorType.UNKNOWN,
		message: "An unexpected error occurred",
	};
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
