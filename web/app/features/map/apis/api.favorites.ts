import { db } from "@itcom/db/client";
import { mapLocations, userFavorites } from "@itcom/db/schema";
import { and, eq } from "drizzle-orm";

export type CreateFavoriteInput = {
	userId: string;
	locationId: string;
};

export type DeleteFavoriteInput = {
	userId: string;
	locationId: string;
};

/**
 * 즐겨찾기 추가
 */
export async function addFavorite({ userId, locationId }: CreateFavoriteInput) {
	try {
		// 중복 확인
		const existing = await db.query.userFavorites.findFirst({
			where: and(
				eq(userFavorites.userId, userId),
				eq(userFavorites.locationId, locationId),
			),
		});

		if (existing) {
			return { success: false, error: "이미 즐겨찾기에 추가되었습니다" };
		}

		// 위치 존재 확인
		const location = await db.query.mapLocations.findFirst({
			where: eq(mapLocations.id, locationId),
		});

		if (!location) {
			return { success: false, error: "위치를 찾을 수 없습니다" };
		}

		// 즐겨찾기 추가
		const result = await db
			.insert(userFavorites)
			.values({
				userId,
				locationId,
			})
			.returning();

		return { success: true, favorite: result[0] };
	} catch (error) {
		console.error("[Favorites API] Add error:", error);
		return { success: false, error: "즐겨찾기 추가에 실패했습니다" };
	}
}

/**
 * 사용자의 모든 즐겨찾기 조회 (위치 정보 포함)
 */
export async function getUserFavorites(userId: string) {
	try {
		const favorites = await db.query.userFavorites.findMany({
			where: eq(userFavorites.userId, userId),
			with: {
				location: true,
			},
		});

		return {
			success: true,
			favorites: favorites.map((fav) => ({
				id: fav.id,
				locationId: fav.location.id,
				location: {
					...fav.location,
					latitude: Number(fav.location.latitude),
					longitude: Number(fav.location.longitude),
				},
				createdAt: fav.createdAt,
			})),
		};
	} catch (error) {
		console.error("[Favorites API] Get error:", error);
		return {
			success: false,
			error: "즐겨찾기 조회에 실패했습니다",
			favorites: [],
		};
	}
}

/**
 * 즐겨찾기 삭제
 */
export async function removeFavorite({
	userId,
	locationId,
}: DeleteFavoriteInput) {
	try {
		const result = await db
			.delete(userFavorites)
			.where(
				and(
					eq(userFavorites.userId, userId),
					eq(userFavorites.locationId, locationId),
				),
			)
			.returning();

		if (result.length === 0) {
			return { success: false, error: "즐겨찾기를 찾을 수 없습니다" };
		}

		return { success: true };
	} catch (error) {
		console.error("[Favorites API] Delete error:", error);
		return { success: false, error: "즐겨찾기 삭제에 실패했습니다" };
	}
}

/**
 * 특정 위치가 즐겨찾기에 있는지 확인
 */
export async function isFavorite(
	userId: string,
	locationId: string,
): Promise<boolean> {
	try {
		const favorite = await db.query.userFavorites.findFirst({
			where: and(
				eq(userFavorites.userId, userId),
				eq(userFavorites.locationId, locationId),
			),
		});
		return !!favorite;
	} catch {
		return false;
	}
}
