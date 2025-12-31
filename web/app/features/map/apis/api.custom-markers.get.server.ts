import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "react-router";
import {
	createCustomMarker,
	deleteCustomMarker,
	getUserCustomMarkers,
	updateCustomMarker,
} from "./api.custom-markers.server";
import { actionHandler, loaderHandler, BadRequestError, UnauthorizedError, InternalError } from "~/shared/lib";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		throw new UnauthorizedError("인증이 필요합니다");
	}

	try {
		const result = await getUserCustomMarkers(userId);
		return result;
	} catch (error) {
		console.error("[Custom Markers API] Loader error:", error);
		throw new InternalError("커스텀 마커 조회 실패");
	}
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		throw new UnauthorizedError("인증이 필요합니다");
	}

	// 생성
	if (request.method === "POST") {
		try {
			const body = await request.json();
			const result = await createCustomMarker({
				userId,
				...body,
			});
			return result;
		} catch (error) {
			throw new BadRequestError("요청 처리 실패");
		}
	}

	// 수정
	if (request.method === "PUT") {
		try {
			const body = await request.json();
			const result = await updateCustomMarker({
				userId,
				...body,
			});
			return result;
		} catch (error) {
			throw new BadRequestError("요청 처리 실패");
		}
	}

	// 삭제
	if (request.method === "DELETE") {
		try {
			const body = await request.json();
			const { id } = body;

			if (!id) {
				throw new BadRequestError("id가 필요합니다");
			}

			const result = await deleteCustomMarker(id, userId);
			return result;
		} catch (error) {
			throw new BadRequestError("요청 처리 실패");
		}
	}

	throw new BadRequestError("지원하지 않는 요청입니다");
});
