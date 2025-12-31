/**
 * HTTP Errors
 *
 * 일반적인 HTTP 에러 클래스들
 * 직관적 사용: throw new NotFoundError("User")
 */

import { AppError, ErrorCode } from "./app-error";

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
	constructor(message = "Bad request", details?: unknown) {
		super(ErrorCode.BAD_REQUEST, message, 400, details);
	}
}

/**
 * 400 Validation Error
 */
export class ValidationError extends AppError {
	constructor(details: Record<string, string | string[]>) {
		super(ErrorCode.VALIDATION_ERROR, "Validation failed", 400, details);
	}
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
	constructor(message = "Authentication required") {
		super(ErrorCode.UNAUTHORIZED, message, 401);
	}
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
	constructor(message = "Access denied") {
		super(ErrorCode.FORBIDDEN, message, 403);
	}
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
	constructor(resource = "Resource") {
		super(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
	}
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
	constructor(message = "Resource already exists") {
		super(ErrorCode.CONFLICT, message, 409);
	}
}

/**
 * 429 Rate Limit
 */
export class RateLimitError extends AppError {
	constructor(message = "Too many requests") {
		super(ErrorCode.RATE_LIMIT, message, 429);
	}
}

/**
 * 423 Resource Locked
 */
export class ResourceLockedError extends AppError {
	constructor(message = "Resource is locked") {
		super(ErrorCode.RESOURCE_LOCKED, message, 423);
	}
}

/**
 * 410 Expired
 */
export class ExpiredError extends AppError {
	constructor(resource = "Token") {
		super(ErrorCode.EXPIRED, `${resource} has expired`, 410);
	}
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
	constructor(message = "Service unavailable") {
		super(ErrorCode.SERVICE_UNAVAILABLE, message, 503);
	}
}

/**
 * 413 Payload Too Large
 */
export class PayloadTooLargeError extends AppError {
	constructor(message = "Payload too large", details?: unknown) {
		super(ErrorCode.PAYLOAD_TOO_LARGE, message, 413, details);
	}
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends AppError {
	constructor(message = "Internal server error", details?: unknown) {
		super(ErrorCode.INTERNAL_ERROR, message, 500, details);
	}
}
