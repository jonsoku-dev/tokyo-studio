/**
 * Response Builder
 *
 * NestJS Interceptor 스타일의 응답 래퍼
 * 직관적 API: ok(data), created(data), paginated(items, meta)
 */

import type { ApiResponse, PaginationMeta, SuccessResponse } from "./types";

/**
 * 메타데이터 생성
 */
function createMeta(pagination?: PaginationMeta) {
	return {
		timestamp: new Date().toISOString(),
		...(pagination && { pagination }),
	};
}

/**
 * 200 OK 응답
 */
export function ok<T>(data: T): SuccessResponse<T> {
	return {
		success: true,
		data,
		meta: createMeta(),
	};
}

/**
 * 201 Created 응답
 */
export function created<T>(data: T): SuccessResponse<T> {
	return {
		success: true,
		data,
		meta: createMeta(),
	};
}

/**
 * 페이지네이션 응답
 */
export function paginated<T>(
	items: T[],
	pagination: PaginationMeta,
): SuccessResponse<T[]> {
	return {
		success: true,
		data: items,
		meta: createMeta(pagination),
	};
}

/**
 * 페이지네이션 메타 헬퍼
 */
export function createPaginationMeta(
	page: number,
	limit: number,
	total: number,
): PaginationMeta {
	const totalPages = Math.ceil(total / limit);
	return {
		page,
		limit,
		total,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
}

/**
 * 204 No Content 응답
 */
export function noContent(): ApiResponse<null> {
	return {
		success: true,
		data: null,
		meta: createMeta(),
	};
}
