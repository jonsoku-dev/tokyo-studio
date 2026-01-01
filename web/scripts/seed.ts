import { randomUUID } from "node:crypto";
import * as schema from "@itcom/db/schema";
import { pipelineItems, pipelineStages, tasks, users } from "@itcom/db/schema";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Load environment variables
config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
	connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema });

/**
 * Seed the database with test data
 * Generates deterministic test data for development
 */
async function seedDatabase() {
	try {
		console.log("🌱 Starting database seed...\n");

		// Step 0: Clear existing test data
		console.log("🗑️  Clearing existing test data...");
		await db.delete(pipelineItems);
		await db.delete(pipelineStages);
		await db.delete(tasks);
		console.log("✅ Test data cleared\n");

		// Step 1: Create or fetch test user
		console.log("📝 Creating test user...");

		// First try to fetch existing user
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, "test@example.com"));

		let userId: string;

		if (existingUser.length > 0) {
			userId = existingUser[0].id;
			console.log("✅ Using existing test user:", userId, "\n");
		} else {
			// Create new user with proper UUID
			const newUserId = randomUUID();
			await db.insert(users).values({
				id: newUserId,
				email: "test@example.com",
				name: "Test User",
				displayName: "Test User",
				role: "user",
				status: "active",
			});
			userId = newUserId;
			console.log("✅ Test user created:", userId, "\n");
		}

		// Step 2: Seed Pipeline Stages
		console.log("📝 Seeding pipeline stages...");

		const stageConfigs = [
			{ name: "interested", displayName: "Interested", orderIndex: 0 },
			{ name: "applied", displayName: "Applied", orderIndex: 1 },
			{ name: "assignment", displayName: "Assignment", orderIndex: 2 },
			{ name: "interview_1", displayName: "Interview 1", orderIndex: 3 },
			{ name: "interview_2", displayName: "Interview 2", orderIndex: 4 },
			{ name: "interview_3", displayName: "Interview 3", orderIndex: 5 },
			{ name: "offer", displayName: "Offer", orderIndex: 6 },
			{ name: "visa_coe", displayName: "Visa / COE", orderIndex: 7 },
			{ name: "joined", displayName: "Joined", orderIndex: 8 },
			{ name: "rejected", displayName: "Rejected", orderIndex: 9 },
			{ name: "withdrawn", displayName: "Withdrawn", orderIndex: 10 },
		];

		await db.insert(pipelineStages).values(stageConfigs);
		console.log("✅ Seeded 11 pipeline stages\n");

		// Step 3: Seed Pipeline Items
		console.log("📝 Seeding pipeline items...");

		const companies = [
			"Google Japan",
			"Sony",
			"Rakuten",
			"Mercari",
			"LINE",
			"DeNA",
			"Sansan",
			"Wantedly",
			"Amazon Japan",
			"Microsoft Japan",
		];

		const positions = [
			"Senior Software Engineer",
			"Software Developer",
			"Backend Engineer",
			"Full Stack Engineer",
			"Engineering Lead",
			"Frontend Engineer",
			"DevOps Engineer",
			"Solutions Architect",
		];

		const stages = [
			"interested",
			"applied",
			"assignment",
			"interview_1",
			"interview_2",
			"interview_3",
			"offer",
			"visa_coe",
			"joined",
			"rejected",
			"withdrawn",
		];

		const nextActions = [
			"Check job requirements",
			"Prepare resume",
			"Wait for response",
			"Follow up in 2 weeks",
			"Submit coding assignment",
			"Interview scheduled",
			"Final interview pending",
			"Negotiate salary and benefits",
			"Keep in touch",
			null,
		];

		// Track order index for each stage
		const stageOrderMap: Record<string, number> = {};

		const pipelineData = Array.from({ length: 9 }, (_, i) => {
			const stageForItem = stages[i % stages.length];
			const currentOrder = stageOrderMap[stageForItem] ?? 0;
			stageOrderMap[stageForItem] = currentOrder + 1;

			return {
				company: companies[i % companies.length],
				position: positions[i % positions.length],
				stage: stageForItem,
				date: new Date(Date.now() - i * 10 * 24 * 60 * 60 * 1000)
					.toISOString()
					.split("T")[0],
				nextAction: nextActions[i % nextActions.length],
				orderIndex: currentOrder,
				userId,
			};
		});

		await db.insert(pipelineItems).values(pipelineData);
		console.log("✅ Seeded 9 pipeline items\n");

		// Step 4: Seed Roadmap Tasks
		console.log("📝 Seeding roadmap tasks...");

		const taskTitles = [
			"Improve Japanese Language Skills",
			"Build Portfolio Projects",
			"Research Japanese IT Companies",
			"Network with Japanese Tech Professionals",
			"Optimize Resume for Japanese Market",
			"Prepare for Technical Interviews",
			"Study Cloud Architecture",
			"Review System Design Patterns",
		];

		const taskDescriptions = [
			"Focus on business Japanese and IT terminology. Target N2 level.",
			"Create 2-3 portfolio projects showcasing backend and DevOps skills.",
			"Compile list of 50+ target companies and analyze them.",
			"Attend tech meetups and build connections on LinkedIn.",
			"Rewrite resume highlighting relevant skills and experience.",
			"Review algorithms, system design, and company-specific problems.",
			"Deep dive into AWS, GCP, and Azure services.",
			"Study microservices, distributed systems, and scalability.",
		];

		const taskStatuses = ["pending", "in_progress", "completed"];
		const taskPriorities = ["urgent", "normal"];

		const taskData = Array.from({ length: 6 }, (_, i) => {
			const daysOffset = i % 2 === 0 ? 60 : -30;
			const days = Math.floor(Math.random() * Math.abs(daysOffset));
			const actualDays = daysOffset > 0 ? days : -days;

			return {
				title: taskTitles[i % taskTitles.length],
				description: taskDescriptions[i % taskDescriptions.length],
				category: "Roadmap",
				status: taskStatuses[i % taskStatuses.length],
				priority: taskPriorities[i % taskPriorities.length],
				dueDate: new Date(Date.now() + actualDays * 24 * 60 * 60 * 1000)
					.toISOString()
					.split("T")[0],
				userId,
			};
		});

		await db.insert(tasks).values(taskData);
		console.log("✅ Seeded 6 roadmap tasks\n");

		console.log("✅ Database seeding completed successfully!");
		console.log("📊 Test user email: test@example.com");
		console.log("📊 Test user ID:", userId, "\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run seed
seedDatabase();
