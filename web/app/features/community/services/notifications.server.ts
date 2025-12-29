import { db } from "@itcom/db/client";
import { commentNotifications } from "@itcom/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { NotificationWithData } from "./types";

export const notificationsService = {
	async getUserNotifications(userId: string): Promise<NotificationWithData[]> {
		const notifs = await db.query.commentNotifications.findMany({
			where: eq(commentNotifications.userId, userId),
			orderBy: [desc(commentNotifications.createdAt)],
			with: {
				actor: {
					columns: {
						id: true,
						name: true,
						avatarUrl: true,
						avatarThumbnailUrl: true,
					},
				},
				comment: {
					columns: {
						id: true,
						content: true,
						postId: true,
					},
				},
			},
			limit: 20, // Limit for MVP
		});

		return notifs as NotificationWithData[];
	},

	async markAsRead(notificationId: string, userId: string) {
		await db
			.update(commentNotifications)
			.set({ read: true })
			.where(
				and(
					eq(commentNotifications.id, notificationId),
					eq(commentNotifications.userId, userId),
				),
			);
	},

	async markAllAsRead(userId: string) {
		await db
			.update(commentNotifications)
			.set({ read: true })
			.where(eq(commentNotifications.userId, userId));
	},
};
