import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@itcom/db/client";
import { mentoringSessions } from "@itcom/db/schema";

export const BookingService = {
	// Lock a slot with 5 min expiration
	async lockSlot(
		mentorId: string,
		userId: string,
		date: Date,
		duration: number,
		price: number,
		topic: string,
	) {
		// Calculate end time
		const startTime = date;
		const endTime = new Date(date.getTime() + duration * 60000);

		// Check overlap: (SlotStart < ExistingEnd) AND (SlotEnd > ExistingStart)
		// We exclude expired locks
		const existing = await db.query.mentoringSessions.findFirst({
			where: (ms, { and, eq, or, gt }) =>
				and(
					eq(ms.mentorId, mentorId),
					sql`${ms.date} < ${endTime.toISOString()}::timestamp`,
					sql`(${ms.date} + (${ms.duration} || ' minutes')::interval) > ${startTime.toISOString()}::timestamp`,
					or(
						eq(ms.status, "confirmed"),
						eq(ms.status, "completed"),
						and(eq(ms.status, "pending"), gt(ms.expiresAt, new Date())),
					),
				),
		});

		if (existing) {
			throw new Error("Slot unavailable");
		}

		const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

		// Create pending session
		const [session] = await db
			.insert(mentoringSessions)
			.values({
				mentorId,
				userId,
				date: startTime.toISOString(),
				duration,
				price,
				topic,
				status: "pending",
				expiresAt,
				lockedAt: new Date(),
			})
			.returning();

		return session;
	},

	async confirmBooking(sessionId: string, meetingUrl?: string) {
		// Payment verification should happen here or before calling this.
		const [session] = await db
			.update(mentoringSessions)
			.set({
				status: "confirmed",
				meetingUrl: meetingUrl || "https://meet.google.com/placeholder-link",
				updatedAt: new Date(),
			})
			.where(eq(mentoringSessions.id, sessionId))
			.returning();
		return session;
	},

	async releaseExpiredLocks() {
		// Find pending sessions where expiresAt < now
		const now = new Date();
		await db
			.delete(mentoringSessions)
			.where(
				and(
					eq(mentoringSessions.status, "pending"),
					lt(mentoringSessions.expiresAt, now),
				),
			);
	},
};
