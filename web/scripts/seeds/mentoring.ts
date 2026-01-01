import * as schema from "@itcom/db/schema";
import { faker } from "@faker-js/faker";
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
	const [mentor] = await db
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
		isActive: true,
		isTopRated: true,
		averageRating: 490, // 4.9
		totalReviews: 15,
		totalSessions: 50,
	});

	// Mentor Availability
	await db.insert(schema.mentorAvailability).values([
		{
			mentorId: mentor.id,
			dayOfWeek: "1", // Mon
			startTime: "19:00",
			endTime: "22:00",
		},
		{
			mentorId: mentor.id,
			dayOfWeek: "3", // Wed
			startTime: "19:00",
			endTime: "22:00",
		},
		{
			mentorId: mentor.id,
			dayOfWeek: "6", // Sat
			startTime: "10:00",
			endTime: "18:00",
		},
	]);

	// 2. Create Mentees
	const menteeIds = [];
	for (let i = 0; i < 3; i++) {
		const [user] = await db
			.insert(schema.users)
			.values({
				email: faker.internet.email(),
				name: faker.person.fullName(),
				displayName: faker.person.fullName(),
				avatarUrl: faker.image.avatar(),
				role: "user",
			})
			.returning();
		menteeIds.push(user.id);
	}

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
