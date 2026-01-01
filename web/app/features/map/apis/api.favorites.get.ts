import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
	actionHandler,
	BadRequestError,
	InternalError,
	loaderHandler,
	UnauthorizedError,
} from "~/shared/lib";
import {
	addFavorite,
	getUserFavorites,
	removeFavorite,
} from "./api.favorites.server";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	// 사용자 ID 가져오기 (실제 구현 시 세션에서 가져옴)
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		throw new UnauthorizedError("인증이 필요합니다");
	}

	try {
		const result = await getUserFavorites(userId);
		return result;
	} catch (error) {
		console.error("[Favorites API] Loader error:", error);
		throw new InternalError("즐겨찾기 조회 실패");
	}
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		throw new UnauthorizedError("인증이 필요합니다");
	}

	if (request.method === "POST") {
		const body = await request.json();
		const { locationId } = body;

		if (!locationId) {
			throw new BadRequestError("locationId가 필요합니다");
		}

		const result = await addFavorite({ userId, locationId });
		return result;
	}

	if (request.method === "DELETE") {
		const body = await request.json();
		const { locationId } = body;

		if (!locationId) {
			throw new BadRequestError("locationId가 필요합니다");
		}

		const result = await removeFavorite({ userId, locationId });
		return result;
	}

	throw new BadRequestError("지원하지 않는 요청입니다");
});
