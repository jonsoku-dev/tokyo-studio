/**
 * Response Types
 *
 * 통일된 API 응답 형태 정의
 */

/**
 * 메인 API 응답 인터페이스
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: ApiError;
	meta?: ResponseMeta;
}

/**
 * 에러 응답 상세
 */
export interface ApiError {
	/** 에러 코드 (e.g., "VALIDATION_ERROR") */
	code: string;
	/** 사용자 친화적 메시지 */
	message: string;
	/** 필드별 에러 등 상세 정보 */
	details?: unknown;
	/** 개발 환경에서만 노출 */
	stack?: string;
}

/**
 * 응답 메타데이터
 */
export interface ResponseMeta {
	timestamp: string;
	requestId?: string;
	pagination?: PaginationMeta;
}

/**
 * 페이지네이션 메타
 */
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

/**
 * 성공 응답 타입 헬퍼
 */
export type SuccessResponse<T> = ApiResponse<T> & { success: true; data: T };

/**
 * 에러 응답 타입 헬퍼
 */
export type ErrorResponse = ApiResponse<never> & {
	success: false;
	error: ApiError;
};
