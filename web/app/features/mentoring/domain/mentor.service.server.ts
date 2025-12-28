import { eq } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { mentorAvailability, mentors } from "~/shared/db/schema";

export const mentorService = {
	async getMentorByUserId(userId: string) {
		return await db.query.mentors.findFirst({
			where: eq(mentors.userId, userId),
			with: {
				// availability: true // If we had relation defined in schema builders, but we are using raw tables mostly
			},
		});
	},

	async getAvailability(mentorId: string) {
		return await db
			.select()
			.from(mentorAvailability)
			.where(eq(mentorAvailability.mentorId, mentorId));
	},

	async updateAvailability(
		mentorId: string,
		dayOfWeek: string,
		startTime: string,
		endTime: string,
	) {
		// Simple add for now. Ideally should handle overlap or replace.
		// For MVP, we'll just insert. Logic to clear can be added later.
		return await db
			.insert(mentorAvailability)
			.values({
				mentorId,
				dayOfWeek,
				startTime,
				endTime,
			})
			.returning();
	},

	async clearAvailability(mentorId: string, _dayOfWeek: string) {
		return await db.delete(mentorAvailability).where(
			eq(mentorAvailability.mentorId, mentorId),
			// AND dayOfWeek matching if specific
		); // Deletes all for mentor for simplicity or filter by day
	},
};
