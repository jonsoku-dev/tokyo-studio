import { db } from "@itcom/db/client";
import { customMarkers } from "@itcom/db/schema";
import { eq } from "drizzle-orm";

export type CreateCustomMarkerInput = {
	userId: string;
	name: string;
	category: string;
	latitude: number;
	longitude: number;
	notes?: string;
};

export type UpdateCustomMarkerInput = {
	id: string;
	userId: string;
	name?: string;
	category?: string;
	latitude?: number;
	longitude?: number;
	notes?: string;
};

/**
 * 커스텀 마커 생성
 */
export async function createCustomMarker(input: CreateCustomMarkerInput) {
	try {
		const result = await db
			.insert(customMarkers)
			.values({
				userId: input.userId,
				name: input.name,
				category: input.category,
				latitude: input.latitude.toString(),
				longitude: input.longitude.toString(),
				notes: input.notes,
			})
			.returning();

		const marker = result[0];
		return {
			success: true,
			marker: {
				...marker,
				latitude: Number(marker.latitude),
				longitude: Number(marker.longitude),
			},
		};
	} catch (error) {
		console.error("[Custom Markers API] Create error:", error);
		return { success: false, error: "커스텀 마커 생성에 실패했습니다" };
	}
}

/**
 * 사용자의 모든 커스텀 마커 조회
 */
export async function getUserCustomMarkers(userId: string) {
	try {
		const markers = await db.query.customMarkers.findMany({
			where: eq(customMarkers.userId, userId),
		});

		return {
			success: true,
			markers: markers.map((marker) => ({
				...marker,
				latitude: Number(marker.latitude),
				longitude: Number(marker.longitude),
			})),
		};
	} catch (error) {
		console.error("[Custom Markers API] Get error:", error);
		return {
			success: false,
			error: "커스텀 마커 조회에 실패했습니다",
			markers: [],
		};
	}
}

/**
 * 커스텀 마커 수정
 */
export async function updateCustomMarker(input: UpdateCustomMarkerInput) {
	try {
		// 소유권 확인
		const marker = await db.query.customMarkers.findFirst({
			where: eq(customMarkers.id, input.id),
		});

		if (!marker || marker.userId !== input.userId) {
			return { success: false, error: "커스텀 마커를 수정할 권한이 없습니다" };
		}

		// biome-ignore lint/suspicious/noExplicitAny: Dynamic updates object
		const updates: any = {};
		if (input.name !== undefined) updates.name = input.name;
		if (input.category !== undefined) updates.category = input.category;
		if (input.latitude !== undefined)
			updates.latitude = input.latitude.toString();
		if (input.longitude !== undefined)
			updates.longitude = input.longitude.toString();
		if (input.notes !== undefined) updates.notes = input.notes;

		const result = await db
			.update(customMarkers)
			.set(updates)
			.where(eq(customMarkers.id, input.id))
			.returning();

		const updated = result[0];
		return {
			success: true,
			marker: {
				...updated,
				latitude: Number(updated.latitude),
				longitude: Number(updated.longitude),
			},
		};
	} catch (error) {
		console.error("[Custom Markers API] Update error:", error);
		return { success: false, error: "커스텀 마커 수정에 실패했습니다" };
	}
}

/**
 * 커스텀 마커 삭제
 */
export async function deleteCustomMarker(id: string, userId: string) {
	try {
		// 소유권 확인
		const marker = await db.query.customMarkers.findFirst({
			where: eq(customMarkers.id, id),
		});

		if (!marker || marker.userId !== userId) {
			return { success: false, error: "커스텀 마커를 삭제할 권한이 없습니다" };
		}

		await db.delete(customMarkers).where(eq(customMarkers.id, id));

		return { success: true };
	} catch (error) {
		console.error("[Custom Markers API] Delete error:", error);
		return { success: false, error: "커스텀 마커 삭제에 실패했습니다" };
	}
}
