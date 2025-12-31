import { db } from "@itcom/db/client";
import { mapLocations } from "@itcom/db/schema";
import { and, eq, ilike } from "drizzle-orm";

export type GetLocationsQuery = {
	categories?: string[];
	area?: string;
	search?: string;
};

/**
 * 위치 데이터 조회 (필터링 지원)
 * - 카테고리: government, immigration, banking, mobile, housing, shopping
 * - area: tokyo (기본값)
 * - search: 위치명 또는 주소 검색
 */
export async function getLocations(query: GetLocationsQuery) {
	const { categories, area = "tokyo", search } = query;

	const whereConditions: any[] = [eq(mapLocations.area, area)];

	if (categories && categories.length > 0) {
		whereConditions.push(
			// category가 categories 배열에 포함되어야 함
			// Drizzle에서 IN 절을 사용하려면 inArray 사용
			// 그런데 text 타입이라 직접 or 조건으로 처리
		);
	}

	if (search) {
		whereConditions.push(
			// 검색: 이름(EN/JA/KO) 또는 주소에서 일부 문자열 매칭
			// 단순히 ilike로 처리 (클라이언트 사이드 정확한 검색은 별도)
		);
	}

	const locations = await db.query.mapLocations.findMany({
		where:
			categories && categories.length > 0
				? and(
						eq(mapLocations.area, area),
						// 카테고리 필터는 메모리에서 처리
					)
				: eq(mapLocations.area, area),
		limit: 500, // 한 번에 최대 500개 반환
	});

	// 클라이언트 사이드에서 추가 필터링
	let filtered = locations;

	if (categories && categories.length > 0) {
		filtered = filtered.filter((loc) => categories.includes(loc.category));
	}

	if (search) {
		const searchLower = search.toLowerCase();
		filtered = filtered.filter(
			(loc) =>
				loc.nameEn.toLowerCase().includes(searchLower) ||
				loc.nameJa.toLowerCase().includes(searchLower) ||
				loc.nameKo.toLowerCase().includes(searchLower) ||
				loc.address.toLowerCase().includes(searchLower),
		);
	}

	return {
		locations: filtered,
		total: filtered.length,
	};
}

/**
 * 검색 자동완성
 * - 3자 이상 입력 시 즉시 제안
 * - 최대 10개 결과 반환
 */
export async function getLocationSuggestions(
	query: string,
	area: string = "tokyo",
) {
	if (query.length < 3) return [];

	const allLocations = await db.query.mapLocations.findMany({
		where: eq(mapLocations.area, area),
		limit: 500,
	});

	const searchLower = query.toLowerCase();
	const suggestions = allLocations
		.filter(
			(loc) =>
				loc.nameEn.toLowerCase().includes(searchLower) ||
				loc.nameJa.toLowerCase().includes(searchLower) ||
				loc.nameKo.toLowerCase().includes(searchLower),
		)
		.slice(0, 10)
		.map((loc) => ({
			id: loc.id,
			name: loc.nameEn,
			category: loc.category,
		}));

	return suggestions;
}

/**
 * 단일 위치 상세 조회
 */
export async function getLocationById(id: string) {
	const location = await db.query.mapLocations.findFirst({
		where: eq(mapLocations.id, id),
	});

	return location || null;
}
