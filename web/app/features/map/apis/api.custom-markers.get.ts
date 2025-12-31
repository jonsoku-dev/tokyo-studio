import {
	type ActionFunctionArgs,
	data,
	type LoaderFunctionArgs,
} from "react-router";
import {
	createCustomMarker,
	deleteCustomMarker,
	getUserCustomMarkers,
	updateCustomMarker,
} from "./api.custom-markers";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		return data({ error: "인증이 필요합니다" }, { status: 401 });
	}

	try {
		const result = await getUserCustomMarkers(userId);
		return data(result);
	} catch (error) {
		console.error("[Custom Markers API] Loader error:", error);
		return data({ error: "커스텀 마커 조회 실패" }, { status: 500 });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = request.headers.get("X-User-Id");
	if (!userId) {
		return data({ error: "인증이 필요합니다" }, { status: 401 });
	}

	// 생성
	if (request.method === "POST") {
		try {
			const body = await request.json();
			const result = await createCustomMarker({
				userId,
				...body,
			});
			return data(result);
		} catch (error) {
			return data({ error: "요청 처리 실패" }, { status: 400 });
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
			return data(result);
		} catch (error) {
			return data({ error: "요청 처리 실패" }, { status: 400 });
		}
	}

	// 삭제
	if (request.method === "DELETE") {
		try {
			const body = await request.json();
			const { id } = body;

			if (!id) {
				return data({ error: "id가 필요합니다" }, { status: 400 });
			}

			const result = await deleteCustomMarker(id, userId);
			return data(result);
		} catch (error) {
			return data({ error: "요청 처리 실패" }, { status: 400 });
		}
	}

	return data({ error: "지원하지 않는 요청입니다" }, { status: 405 });
}
