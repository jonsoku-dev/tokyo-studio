import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { addFavorite, getUserFavorites, removeFavorite } from "./api.favorites";

export async function loader({ request }: LoaderFunctionArgs) {
	// 사용자 ID 가져오기 (실제 구현 시 세션에서 가져옴)
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		return data({ error: "인증이 필요합니다" }, { status: 401 });
	}

	try {
		const result = await getUserFavorites(userId);
		return data(result);
	} catch (error) {
		console.error("[Favorites API] Loader error:", error);
		return data({ error: "즐겨찾기 조회 실패" }, { status: 500 });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		return data({ error: "인증이 필요합니다" }, { status: 401 });
	}

	if (request.method === "POST") {
		const body = await request.json();
		const { locationId } = body;

		if (!locationId) {
			return data({ error: "locationId가 필요합니다" }, { status: 400 });
		}

		const result = await addFavorite({ userId, locationId });
		return data(result);
	}

	if (request.method === "DELETE") {
		const body = await request.json();
		const { locationId } = body;

		if (!locationId) {
			return data({ error: "locationId가 필요합니다" }, { status: 400 });
		}

		const result = await removeFavorite({ userId, locationId });
		return data(result);
	}

	return data({ error: "지원하지 않는 요청입니다" }, { status: 405 });
}
