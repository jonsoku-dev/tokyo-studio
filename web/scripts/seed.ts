import * as schema from "@itcom/db/schema";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seedAuth } from "./seeds/auth";
import { seedCategories } from "./seeds/categories";
import { seedCommunity } from "./seeds/community";
import { seedCommunityCategories } from "./seeds/community-categories";
import { seedMentoring } from "./seeds/mentoring";
import { seedPhases } from "./seeds/phases";
import { seedPipeline } from "./seeds/pipeline";
import { seedRoadmap } from "./seeds/roadmap";
import { seedSettlement } from "./seeds/settlement";

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
export async function seedDatabase() {
	try {
		console.log("🌱 Starting database seed...\n");

		// Clear dependent tables first to avoid foreign key constraints
		await db.delete(schema.voteAuditLogs);
		await db.delete(schema.reputationLogs);
		await db.delete(schema.commentVotes);
		await db.delete(schema.postVotes);
		await db.delete(schema.commentNotifications);
		await db.delete(schema.communityComments);
		await db.delete(schema.communityPosts);
		await db.delete(schema.communityRules);
		await db.delete(schema.communityMembers);
		await db.delete(schema.communities);
		await db.delete(schema.communityCategories);

		await db.delete(schema.settlementReviews);
		await db.delete(schema.settlementTaskTemplates);
		await db.delete(schema.settlementTemplates);
		await db.delete(schema.settlementPhases);
		await db.delete(schema.settlementCategories); // Clear categories
		await db.delete(schema.pipelineItems);
		await db.delete(schema.pipelineStages);
		await db.delete(schema.profiles);
		await db.delete(schema.documents);
		await db.delete(schema.tasks);
		await db.delete(schema.mentorReviews);
		await db.delete(schema.mentoringSessions);
		await db.delete(schema.mentorApplications);
		await db.delete(schema.mentorProfiles);
		await db.delete(schema.mentors);
		await db.delete(schema.users);

		// 1. Core Data (Users, Categories)
		const userId = await seedAuth(db);

		// Step 2: Pipeline
		await seedPipeline(db, userId);

		// Step 3: Roadmap
		await seedRoadmap(db, userId);

		// Step 3.5: Phases & Categories
		await seedPhases(db);
		await seedCategories(db); // Uses db import internally, might need check

		// Step 3.6: Community
		await seedCommunity(db);

		// Step 4: Settlement
		await seedSettlement(db, userId);

		// Step 5: Mentoring
		await seedMentoring(db, userId);

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
