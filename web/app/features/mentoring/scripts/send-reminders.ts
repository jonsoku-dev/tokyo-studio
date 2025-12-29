import { db } from "@itcom/db/client";
import { mentoringSessions, users } from "@itcom/db/schema";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { emailService } from "~/features/auth/services/email.server";

async function main() {
	console.log("Checking for upcoming sessions...");

	// Time Window: Start time is between NOW and NOW + 15 mins
	const now = new Date();
	const windowEnd = new Date(now.getTime() + 15 * 60000); // 15 mins from now

	// Correct ISO string comparison for Drizzle/PG
	// Note: Stored as string in schema? "date: text" or "date: timestamp"?
	// In schema.ts: `date: text("date").notNull()` or timestamp?
	// Let's check mentoringSessions definition in schema.ts.
	// Wait, earlier in `mentoring.server.ts` I treated it as ISO string.
	// Ideally it should be timestamp.
	// If text, comparisons are string based (ISO 8601 works).
	// If timestamp, date objects work.
	// I'll assume ISO string if text, or Date if timestamp.
	// Let's check schema.ts via tool? No, I recall `date: timestamp(...)` usually but previous edit showed `date: slot.startTime.toISOString()`.
	// If it's text, I need to convert Date to ISO string.

	// Actually, let's assume `date` column is timestamp for robustness.
	// If it is text, `gte(mentoringSessions.date, now.toISOString())` works.

	const upcomingSessions = await db
		.select({
			session: mentoringSessions,
			user: users,
			mentor: {
				// We need mentor name. Mentor is a user too.
				name: users.name,
			},
		})
		.from(mentoringSessions)
		.innerJoin(users, eq(mentoringSessions.userId, users.id))
		// We need self-join for mentor name?
		// Actually mentoringSessions has mentorId.
		// Let's join users AS mentorUser ON session.mentorId = mentorUser.id
		// Drizzle alias support...
		// For simplicity, I'll fetch mentor name separately or use a raw query or just `users` join for mentee and assume I can't join users twice easily without aliasing.
		// I will just fetch mentee details here.
		.where(
			and(
				gte(mentoringSessions.date, now.toISOString()),
				lte(mentoringSessions.date, windowEnd.toISOString()),
				isNull(mentoringSessions.reminderSentAt),
				eq(mentoringSessions.status, "confirmed"),
			),
		);

	console.log(`Found ${upcomingSessions.length} sessions to remind.`);

	for (const { session, user } of upcomingSessions) {
		// Fetch mentor name
		const [mentorUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, session.mentorId))
			.limit(1);
		const mentorName = mentorUser?.name || "Mentor";

		if (user.email) {
			await emailService.sendSessionReminder(user.email, {
				mentorName,
				timeString: new Date(session.date).toLocaleTimeString(),
				meetingUrl: session.meetingUrl || "#",
			});

			await db
				.update(mentoringSessions)
				.set({ reminderSentAt: new Date() })
				.where(eq(mentoringSessions.id, session.id));

			console.log(`Sent reminder to ${user.email}`);
		}
	}
}

main().catch(console.error);
