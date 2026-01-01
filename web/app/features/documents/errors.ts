/**
 * Document Feature Error Classes
 *
 * Domain-specific errors for document management operations
 * Extends the shared AppError base class
 */

import { AppError, ErrorCode } from "~/shared/lib/errors/app-error";

/**
 * Document not found error (404)
 * Thrown when a document doesn't exist or user doesn't have access
 */
export class DocumentNotFoundError extends AppError {
	constructor(documentId?: string, details?: string) {
		const message = documentId
			? `Document ${documentId} not found or unauthorized`
			: "Document not found or unauthorized";
		super(ErrorCode.NOT_FOUND, message, 404, details);
	}
}

/**
 * Unauthorized document access error (403)
 * Thrown when user doesn't have permission to access a document
 */
export class DocumentUnauthorizedError extends AppError {
	constructor(action = "access this document", details?: string) {
		super(
			ErrorCode.FORBIDDEN,
			`You do not have permission to ${action}`,
			403,
			details,
		);
	}
}

/**
 * Invalid input error (400)
 * Thrown when document operation has invalid parameters
 */
export class DocumentInvalidInputError extends AppError {
	constructor(field: string, reason?: string, details?: unknown) {
		const message = reason ? `Invalid ${field}: ${reason}` : `Invalid ${field}`;
		super(ErrorCode.VALIDATION_ERROR, message, 400, details);
	}
}

/**
 * Storage quota exceeded error (413)
 * Thrown when user has reached storage limit
 */
export class StorageQuotaExceededError extends AppError {
	constructor(
		currentSize: number,
		maxSize: number,
		details?: { userId: string; fileSize: number },
	) {
		super(
			ErrorCode.QUOTA_EXCEEDED,
			`Storage quota exceeded: ${currentSize}MB / ${maxSize}MB`,
			413,
			details,
		);
	}
}

/**
 * File too large error (413)
 * Thrown when uploaded file exceeds size limit
 */
export class FileTooLargeError extends AppError {
	constructor(
		fileSize: number,
		maxSize: number,
		details?: { fileName: string },
	) {
		super(
			ErrorCode.PAYLOAD_TOO_LARGE,
			`File size ${fileSize}MB exceeds maximum ${maxSize}MB`,
			413,
			details,
		);
	}
}

/**
 * Unsupported format error (400)
 * Thrown when file format is not supported
 */
export class UnsupportedFormatError extends AppError {
	constructor(
		format: string,
		supportedFormats: string[],
		details?: { fileName: string },
	) {
		super(
			ErrorCode.BAD_REQUEST,
			`Unsupported format: ${format}. Supported formats: ${supportedFormats.join(", ")}`,
			400,
			details,
		);
	}
}

/**
 * Concurrency error (409)
 * Thrown when document is being edited by another user or process
 */
export class DocumentConcurrencyError extends AppError {
	constructor(documentId: string, details?: { lockedBy?: string }) {
		super(
			ErrorCode.CONFLICT,
			`Document ${documentId} is being edited by another user`,
			409,
			details,
		);
	}
}

/**
 * Standardized error response format for API responses
 */
export interface ErrorResponse {
	error: string;
	code: string;
	details?: unknown;
	retry?: boolean;
}

/**
 * Format error for API response
 * Converts AppError to standardized ErrorResponse format
 */
export function formatErrorResponse(error: AppError): ErrorResponse {
	return {
		error: error.message,
		code: error.code,
		details: error.details,
		retry: shouldRetry(error),
	};
}

/**
 * Determine if operation should be retried
 * Based on error type and HTTP status code
 */
function shouldRetry(error: AppError): boolean {
	// Retry on server errors (5xx) and rate limiting
	if (error.statusCode >= 500) return true;
	if (error.code === ErrorCode.RATE_LIMIT) return true;
	if (error.code === ErrorCode.SERVICE_UNAVAILABLE) return true;

	// Don't retry on client errors (4xx)
	return false;
}
