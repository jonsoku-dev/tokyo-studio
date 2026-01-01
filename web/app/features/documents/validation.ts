/**
 * Input Validation Layer for Document Operations
 * Provides comprehensive validation for all document-related inputs
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
	value?: string | number;
}

// MIME type mappings for file validation
const ALLOWED_MIME_TYPES = {
	"application/pdf": [".pdf"],
	"application/msword": [".doc"],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
		".docx",
	],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document-macro":
		[".docm"],
} as const;

const ALLOWED_DOCUMENT_TYPES = [
	"Resume",
	"CV",
	"Portfolio",
	"Cover Letter",
	"Other",
] as const;

const ALLOWED_DOCUMENT_STATUSES = ["draft", "final"] as const;

/**
 * Validate document title
 * Rules:
 * - Not empty/whitespace only
 * - Max 255 characters
 * - No null bytes
 * - Only alphanumeric, hyphens, underscores, dots, spaces, parentheses, and common punctuation
 */
export function validateDocumentTitle(title: string): ValidationResult {
	// Check for null/undefined
	if (title === null || title === undefined) {
		return { valid: false, error: "Title is required" };
	}

	// Check for empty or whitespace-only
	const trimmed = title.trim();
	if (trimmed.length === 0) {
		return { valid: false, error: "Title cannot be empty or whitespace only" };
	}

	// Check maximum length
	if (trimmed.length > 255) {
		return {
			valid: false,
			error: "Title must not exceed 255 characters",
		};
	}

	// Check for null bytes (potential security issue)
	if (title.includes("\0")) {
		return {
			valid: false,
			error: "Title contains invalid characters (null byte)",
		};
	}

	// Validate character pattern: alphanumeric, spaces, hyphens, underscores, dots, parentheses, common punctuation
	// This prevents XSS and other injection attacks
	const validPattern = /^[\w\s\-_.(),&'":!?/]+$/;
	if (!validPattern.test(trimmed)) {
		return {
			valid: false,
			error:
				"Title contains invalid characters. Only alphanumeric, spaces, and common punctuation allowed",
		};
	}

	return { valid: true, value: trimmed };
}

/**
 * Validate file upload
 * Rules:
 * - MIME types: PDF, DOC, DOCX, DOCM only
 * - File size: Min 1KB, Max 50MB
 * - Extension must match MIME type
 */
export function validateUploadFile(file: File): ValidationResult {
	// Check for null/undefined
	if (!file) {
		return { valid: false, error: "File is required" };
	}

	// Validate file size (min 1KB)
	const MIN_FILE_SIZE = 1024; // 1KB
	if (file.size < MIN_FILE_SIZE) {
		return {
			valid: false,
			error: "File is too small. Minimum size is 1KB",
		};
	}

	// Validate file size (max 50MB)
	const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: "File is too large. Maximum size is 50MB",
		};
	}

	// Validate MIME type
	const allowedMimeTypes = Object.keys(ALLOWED_MIME_TYPES);
	if (!allowedMimeTypes.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type. Only PDF, DOC, DOCX, and DOCM files are allowed. Received: ${file.type}`,
		};
	}

	// Validate file extension matches MIME type
	const fileName = file.name.toLowerCase();
	const mimeType = file.type as keyof typeof ALLOWED_MIME_TYPES;
	const allowedExtensions = ALLOWED_MIME_TYPES[mimeType];

	const hasValidExtension = allowedExtensions.some((ext) =>
		fileName.endsWith(ext),
	);

	if (!hasValidExtension) {
		return {
			valid: false,
			error: `File extension does not match MIME type. Expected: ${allowedExtensions.join(", ")}`,
		};
	}

	return { valid: true, value: file.name };
}

/**
 * Validate document type
 * Rules:
 * - Must be one of: Resume, CV, Portfolio, Cover Letter, Other
 */
export function validateDocumentType(type: string): ValidationResult {
	// Check for null/undefined/empty
	if (!type || type.trim().length === 0) {
		return { valid: false, error: "Document type is required" };
	}

	const trimmed = type.trim();

	// Check against allowed types (case-sensitive)
	if (!ALLOWED_DOCUMENT_TYPES.includes(trimmed as never)) {
		return {
			valid: false,
			error: `Invalid document type. Must be one of: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
		};
	}

	return { valid: true, value: trimmed };
}

/**
 * Validate document status
 * Rules:
 * - Must be: draft or final
 */
export function validateDocumentStatus(status: string): ValidationResult {
	// Check for null/undefined/empty
	if (!status || status.trim().length === 0) {
		return { valid: false, error: "Document status is required" };
	}

	const trimmed = status.trim().toLowerCase();

	// Check against allowed statuses
	if (!ALLOWED_DOCUMENT_STATUSES.includes(trimmed as never)) {
		return {
			valid: false,
			error: `Invalid document status. Must be one of: ${ALLOWED_DOCUMENT_STATUSES.join(", ")}`,
		};
	}

	return { valid: true, value: trimmed };
}

/**
 * Validate search query
 * Rules:
 * - Max 100 characters
 * - No SQL injection attempts (basic check for common patterns)
 * - No null bytes
 */
export function validateSearchQuery(query: string): ValidationResult {
	// Empty query is valid (returns all results)
	if (!query || query.trim().length === 0) {
		return { valid: true, value: "" };
	}

	const trimmed = query.trim();

	// Check maximum length
	if (trimmed.length > 100) {
		return {
			valid: false,
			error: "Search query must not exceed 100 characters",
		};
	}

	// Check for null bytes
	if (trimmed.includes("\0")) {
		return {
			valid: false,
			error: "Search query contains invalid characters (null byte)",
		};
	}

	// Basic SQL injection pattern detection
	// Note: This is a defense-in-depth measure; the real protection is parameterized queries
	const sqlPatterns = [
		/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
		/(;|--|\/\*|\*\/|xp_)/i,
		/(UNION\s+SELECT)/i,
		/('|"|`)\s*(OR|AND)\s*('|"|`)/i,
	];

	for (const pattern of sqlPatterns) {
		if (pattern.test(trimmed)) {
			return {
				valid: false,
				error:
					"Search query contains potentially unsafe characters or patterns",
			};
		}
	}

	return { valid: true, value: trimmed };
}

/**
 * Validate pagination parameters
 * Rules:
 * - page: positive integer (>= 1)
 * - pageSize: integer between 1 and 100
 */
export function validatePaginationParams(
	page: number,
	pageSize: number,
): ValidationResult {
	// Validate page number
	if (!Number.isInteger(page) || page < 1) {
		return {
			valid: false,
			error: "Page must be a positive integer (>= 1)",
		};
	}

	// Validate page size
	if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
		return {
			valid: false,
			error: "Page size must be an integer between 1 and 100",
		};
	}

	return { valid: true, value: page };
}

/**
 * Helper function to create a standardized error response
 */
export function createValidationErrorResponse(
	field: string,
	error: string,
): { error: string; field: string; code: string } {
	return {
		error,
		field,
		code: "VALIDATION_ERROR",
	};
}

/**
 * Validate multiple fields at once
 * Returns array of errors or empty array if all valid
 */
export function validateDocumentUpdate(data: {
	title?: string;
	status?: string;
	type?: string;
}): Array<{ field: string; error: string }> {
	const errors: Array<{ field: string; error: string }> = [];

	if (data.title !== undefined) {
		const titleResult = validateDocumentTitle(data.title);
		if (!titleResult.valid) {
			errors.push({
				field: "title",
				error: titleResult.error ?? "Invalid title",
			});
		}
	}

	if (data.status !== undefined) {
		const statusResult = validateDocumentStatus(data.status);
		if (!statusResult.valid) {
			errors.push({
				field: "status",
				error: statusResult.error ?? "Invalid status",
			});
		}
	}

	if (data.type !== undefined) {
		const typeResult = validateDocumentType(data.type);
		if (!typeResult.valid) {
			errors.push({ field: "type", error: typeResult.error ?? "Invalid type" });
		}
	}

	return errors;
}
