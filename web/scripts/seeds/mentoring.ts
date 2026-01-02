import { faker } from "@faker-js/faker";
import * as schema from "@itcom/db/schema";
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedMentoring(
	db: NodePgDatabase<typeof schema>,
	adminUserId: string,
) {
	console.log("🌱 Seeding Mentoring...");

	// 1. Promote Admin to Mentor (Full Approval)
	// Mentor Application
	await db
		.insert(schema.mentorApplications)
		.values({
			userId: adminUserId,
			jobTitle: "Senior Software Engineer",
			company: "Tech Giant Corp",
			yearsOfExperience: 7,
			linkedinUrl: "https://linkedin.com/in/admin",
			bio: "Expert in React, Node.js, and System Design. Helping you land your first job in Japan.",
			expertise: ["Frontend", "Backend", "System Design", "Career Advice"],
			languages: {
				japanese: "Business",
				english: "Native",
				korean: "Native",
			},
			hourlyRate: 5000,
			verificationFileUrl: "s3://verification/admin.pdf",
			status: "approved",
			reviewedBy: adminUserId,
			reviewedAt: new Date(),
		})
		.returning();

	// Mentors Table (Legacy/Simplified)
	const [_mentor] = await db
		.insert(schema.mentors)
		.values({
			userId: adminUserId,
			title: "Senior Software Engineer",
			company: "Tech Giant Corp",
			bio: "Expert in React, Node.js, and System Design.",
			yearsOfExperience: "7",
			hourlyRate: "5000",
			isApproved: "true",
		})
		.returning();

	// Mentor Availability Rules (Moved up for JSON sync)
	const rules = [
		{
			day: "1", // Mon
			start: "19:00",
			end: "22:00",
		},
		{
			day: "3", // Wed
			start: "19:00",
			end: "22:00",
		},
		{
			day: "6", // Sat
			start: "10:00",
			end: "18:00",
		},
	];

	// Mentor Profiles Table (Extended)
	await db.insert(schema.mentorProfiles).values({
		userId: adminUserId,
		company: "Tech Giant Corp",
		jobTitle: "Senior Software Engineer",
		yearsOfExperience: 7,
		hourlyRate: 5000,
		currency: "JPY",
		bio: "Expert in React, Node.js, and System Design. Helping you land your first job in Japan.",
		specialties: ["Frontend", "Backend", "System Design"],
		languages: ["Korean", "Japanese", "English"],
		timezone: "Asia/Tokyo",
		availability: rules, // Sync JSON for Settings UI
		socialHandles: {
			linkedin: "https://linkedin.com/in/example",
			x: "https://x.com/example",
			youtube: "https://youtube.com/@example",
		},
		videoUrls: [
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Classic
			"https://www.youtube.com/watch?v=5qap5aO4i9A", // Lofi Girl
		],
		preferredVideoProvider: "google",
		isActive: true,
		isTopRated: true,
		averageRating: 490, // 4.9
		totalReviews: 15,
		totalSessions: 50,
	});

	// Generate Concrete Slots for next 30 days
	const slotsToInsert: (typeof schema.mentorAvailabilitySlots.$inferInsert)[] =
		[];
	const today = new Date();

	for (let i = 0; i < 30; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);
		const dayOfWeek = date.getDay().toString(); // 0-6

		// Find rules for this day
		const dayRules = rules.filter((r) => r.day === dayOfWeek);

		for (const rule of dayRules) {
			const [startHour, startMin] = rule.start.split(":").map(Number);
			const slotStart = new Date(date);
			slotStart.setHours(startHour, startMin, 0, 0);

			const [endHour, endMin] = rule.end.split(":").map(Number);
			const slotEnd = new Date(date);
			slotEnd.setHours(endHour, endMin, 0, 0);

			// Break into 30 minute chunks
			let current = new Date(slotStart);
			while (current < slotEnd) {
				const next = new Date(current);
				next.setMinutes(current.getMinutes() + 30);

				if (next > slotEnd) break;

				slotsToInsert.push({
					mentorId: adminUserId, // Use userId as mentorId reference
					startTime: new Date(current),
					endTime: new Date(next),
					isBooked: false,
				});

				current = next;
			}
		}
	}

	if (slotsToInsert.length > 0) {
		await db.insert(schema.mentorAvailabilitySlots).values(slotsToInsert);
	}

	// 2. Get Existing Mentees (from auth.ts seed)
	const potentialMentees = await db
		.select()
		.from(schema.users)
		.where(sql`${schema.users.id} != ${adminUserId}`);

	if (potentialMentees.length === 0) {
		console.warn(
			"⚠️ No potential mentees found. Skipping detailed mentoring seed.",
		);
	}

	const menteeIds = potentialMentees.map((u) => u.id);

	// 3. Create Sessions & Reviews
	for (const menteeId of menteeIds) {
		// Past Sessions (Completed & Reviewed)
		for (let i = 0; i < 2; i++) {
			const date = faker.date.past();
			const [session] = await db
				.insert(schema.mentoringSessions)
				.values({
					mentorId: adminUserId,
					userId: menteeId,
					topic: faker.lorem.sentence(),
					date: date.toISOString(),
					duration: 60,
					status: "completed",
					price: 5000,
					currency: "JPY",
				})
				.returning();

			// Add Review
			const rating = faker.number.int({ min: 4, max: 5 });
			await db.insert(schema.mentorReviews).values({
				sessionId: session.id,
				mentorId: adminUserId, // user table id
				menteeId: menteeId,
				rating: rating,
				text: faker.lorem.paragraph(),
				status: "published",
				createdAt: date,
			});
		}

		// Future Sessions (Confirmed)
		await db.insert(schema.mentoringSessions).values({
			mentorId: adminUserId,
			userId: menteeId,
			topic: "Upcoming Interview Prep",
			date: faker.date.future().toISOString(),
			duration: 60,
			status: "confirmed",
			price: 5000,
			currency: "JPY",
		});
	}

	console.log("✅ Mentoring seeded: Admin is now a verified mentor.");
}
