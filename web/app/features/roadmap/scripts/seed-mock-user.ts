import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import pg from "pg";

// Define tables matching actual schema
const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").unique().notNull(),
	name: text("name").notNull(),
	password: text("password"),
	emailVerified: timestamp("email_verified"),
	avatarUrl: text("avatar_url"),
	role: text("role").default("user"),
	status: text("status").default("active"),
	reputation: integer("reputation").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Correct table name: profiles (not user_profiles)
const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id"),
	jobFamily: text("job_family").notNull(),
	level: text("level").notNull(),
	jpLevel: text("jp_level").notNull(),
	enLevel: text("en_level").notNull(),
	targetCity: text("target_city").default("Tokyo"),
	bio: text("bio"),
	slug: text("slug").unique(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seedMockUser() {
	console.log("🧪 Creating mock user...");

	const mockEmail = "test@example.com";
	const mockPassword = "test1234";
	const passwordHash = await bcrypt.hash(mockPassword, 10);

	// Upsert user
	const [user] = await db
		.insert(users)
		.values({
			email: mockEmail,
			name: "테스트 사용자",
			password: passwordHash,
			emailVerified: new Date(),
			role: "user",
			status: "active",
		})
		.onConflictDoUpdate({
			target: users.email,
			set: {
				password: passwordHash,
				emailVerified: new Date(),
			},
		})
		.returning();

	console.log(`✅ User created: ${user.email} (ID: ${user.id})`);

	// Upsert profile (for roadmap generation)
	await db
		.insert(profiles)
		.values({
			userId: user.id,
			jobFamily: "frontend",
			level: "mid",
			jpLevel: "N3",
			enLevel: "Business",
			targetCity: "Tokyo",
			bio: "테스트 사용자입니다.",
			slug: "test-user",
		})
		.onConflictDoNothing(); // Just skip if already exists

	console.log(`✅ Profile created for user`);
	console.log("");
	console.log("=".repeat(50));
	console.log("🔑 Login Credentials:");
	console.log(`   Email:    ${mockEmail}`);
	console.log(`   Password: ${mockPassword}`);
	console.log("=".repeat(50));

	await pool.end();
}

seedMockUser()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("❌ Seed failed:", err);
		process.exit(1);
	});
