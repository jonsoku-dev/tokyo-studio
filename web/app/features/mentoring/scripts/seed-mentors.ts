import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "@itcom/db/client";
import {
	mentorAvailabilitySlots,
	mentorProfiles,
	users,
} from "@itcom/db/schema";
import { eq } from "drizzle-orm";

async function seedMentors() {
	console.log("🌱 Seeding Mentors...");

	const jobTitles = [
		"Frontend Engineer",
		"Backend Engineer",
		"Fullstack Developer",
		"DevOps Engineer",
		"Product Manager",
		"Engineering Manager",
		"Mobile Developer",
		"Data Scientist",
	];
	const companies = [
		"Google",
		"Amazon",
		"Meta",
		"Netflix",
		"Microsoft",
		"Uber",
		"Airbnb",
		"Startups",
	];
	const expertises = [
		"React",
		"Node.js",
		"Python",
		"Go",
		"AWS",
		"System Design",
		"Career Advice",
		"Interview Prep",
		"Flutter",
		"Swift",
	];

	// Create 10 mentors
	for (let i = 0; i < 10; i++) {
		const email = `mentor${i}@example.com`;
		let user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) {
			const [newUser] = await db
				.insert(users)
				.values({
					email,
					name: faker.person.fullName(),
					displayName: faker.person.firstName(),
					avatarUrl: faker.image.avatar(),
					role: "user", // or "mentor"? Schema says 'role' is text.
					// For now keeping role as user, profile existence implies mentor status or we should update role?
					// Spec doesn't strictly require separate role enum if table exists.
				})
				.returning();
			user = newUser;
		}

		// Create/Update Profile
		const title = faker.helpers.arrayElement(jobTitles);
		const company = faker.helpers.arrayElement(companies);

		// Upsert profile
		await db
			.insert(mentorProfiles)
			.values({
				userId: user.id,
				jobTitle: title,
				company,
				bio: faker.lorem.paragraph(),
				specialties: faker.helpers.arrayElements(expertises, {
					min: 2,
					max: 4,
				}),
				hourlyRate: faker.number.int({ min: 50, max: 300 }) * 100, // cents
				currency: "USD",
				totalSessions: faker.number.int({ min: 0, max: 50 }),
				averageRating: Math.floor(
					faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }) * 100,
				),
				yearsOfExperience: faker.number.int({ min: 2, max: 20 }),
			})
			.onConflictDoUpdate({
				target: mentorProfiles.userId,
				set: {
					jobTitle: title,
					company,
					updatedAt: new Date(),
				},
			});

		// Generate Availability Slots for next 30 days
		// Clear existing slots for this mentor to avoid duplicates if re-run
		await db
			.delete(mentorAvailabilitySlots)
			.where(eq(mentorAvailabilitySlots.mentorId, user.id));

		const slots = [];
		const today = new Date();
		for (let d = 1; d <= 30; d++) {
			// Randomly decide if available this day (70% chance)
			if (Math.random() > 0.3) {
				const date = new Date(today);
				date.setDate(date.getDate() + d);
				date.setHours(0, 0, 0, 0);

				// Create 1-3 slots per day
				const numSlots = faker.number.int({ min: 1, max: 3 });
				for (let s = 0; s < numSlots; s++) {
					const startHour = faker.number.int({ min: 9, max: 20 });
					const slotStart = new Date(date);
					slotStart.setHours(startHour, 0, 0, 0);

					const slotEnd = new Date(slotStart);
					slotEnd.setHours(startHour, 30, 0, 0); // 30 min slots base? or 60? Spec says 30 min increments.
					// Let's create 30 min slots.

					slots.push({
						mentorId: user.id,
						startTime: slotStart,
						endTime: slotEnd,
						isBooked: false,
					});
				}
			}
		}

		if (slots.length > 0) {
			await db.insert(mentorAvailabilitySlots).values(slots);
		}
		console.log(`✅ Seeded mentor: ${user.name} (${title} at ${company})`);
	}

	console.log("✨ Mentor seeding complete!");
}

seedMentors().catch((e) => {
	console.error(e);
	process.exit(1);
});
