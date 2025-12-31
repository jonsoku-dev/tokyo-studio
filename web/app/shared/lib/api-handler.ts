/**
 * API Handler
 *
 * NestJS Interceptor + Exception Filter 역할
 * loader/action을 래핑하여 일관된 응답/에러 처리
 */

import { data } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppError, ErrorCode } from "./errors";
import { ok, type ApiResponse, type ErrorResponse } from "./response";

type HandlerArgs = LoaderFunctionArgs | ActionFunctionArgs;
type HandlerFn<T> = (args: HandlerArgs) => Promise<T>;

/**
 * 에러를 ErrorResponse로 변환
 */
function handleError(error: unknown): ErrorResponse {
	const isDev = process.env.NODE_ENV === "development";

	if (error instanceof AppError) {
		return {
			success: false,
			error: {
				code: error.code,
				message: error.message,
				details: error.details,
				...(isDev && { stack: error.stack }),
			},
			meta: { timestamp: new Date().toISOString() },
		};
	}

	// 예상치 못한 에러
	const message =
		error instanceof Error ? error.message : "An unexpected error occurred";

	console.error("[API Error]", error);

	return {
		success: false,
		error: {
			code: ErrorCode.INTERNAL_ERROR,
			message: isDev ? message : "Internal server error",
			...(isDev && error instanceof Error && { stack: error.stack }),
		},
		meta: { timestamp: new Date().toISOString() },
	};
}

/**
 * API Handler Wrapper
 *
 * @example
 * export const action = apiHandler(async ({ request }) => {
 *   const form = await request.formData();
 *   if (!form.get("name")) throw new ValidationError({ name: "Required" });
 *   return service.create(form);
 * });
 */
export function apiHandler<T>(handler: HandlerFn<T>) {
	return async (args: HandlerArgs) => {
		try {
			const result = await handler(args);

			// If result is a Response object (e.g. redirect), return it directly
			if (result instanceof Response) {
				return result;
			}

			return data(ok(result));
		} catch (error) {
			const errorResponse = handleError(error);
			const statusCode =
				error instanceof AppError ? error.statusCode : 500;

			return data(errorResponse, { status: statusCode });
		}
	};
}

/**
 * Loader 전용 (타입 힌트)
 */
export function loaderHandler<T>(handler: HandlerFn<T>) {
	return apiHandler(handler);
}

/**
 * Action 전용 (타입 힌트)
 */
export function actionHandler<T>(handler: HandlerFn<T>) {
	return apiHandler(handler);
}

// Re-export for convenience
export type { ApiResponse, ErrorResponse };
