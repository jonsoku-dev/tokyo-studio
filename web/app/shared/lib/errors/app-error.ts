/**
 * AppError - Base Error Class
 *
 * NestJS Exception Filter 스타일의 커스텀 에러
 * 모든 비즈니스 에러는 이 클래스를 상속
 */

/**
 * 에러 코드 상수
 */
export const ErrorCode = {
	// 클라이언트 에러 (4xx)
	VALIDATION_ERROR: "VALIDATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	CONFLICT: "CONFLICT",
	RATE_LIMIT: "RATE_LIMIT",
	BAD_REQUEST: "BAD_REQUEST",

	// 서버 에러 (5xx)
	INTERNAL_ERROR: "INTERNAL_ERROR",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

	// 비즈니스 에러
	DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
	INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
	RESOURCE_LOCKED: "RESOURCE_LOCKED",
	EXPIRED: "EXPIRED",
	PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
	QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
	public readonly code: ErrorCodeType;
	public readonly statusCode: number;
	public readonly details?: unknown;
	public readonly isOperational: boolean;

	constructor(
		code: ErrorCodeType,
		message: string,
		statusCode = 400,
		details?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.isOperational = true; // 예상된 에러

		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * JSON 직렬화용
	 */
	toJSON() {
		return {
			code: this.code,
			message: this.message,
			details: this.details,
		};
	}
}
