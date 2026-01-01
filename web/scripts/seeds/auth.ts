import type * as schema from "@itcom/db/schema";
import { users } from "@itcom/db/schema";
import bcrypt from "bcryptjs";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedAuth(db: NodePgDatabase<typeof schema>) {
	console.log("📝 Creating test user...");

	const hashedPassword = await bcrypt.hash("test1234", 10);

	const usersData = [
		{
			id: "00000000-0000-0000-0000-000000000000",
			email: "test@example.com",
			name: "Test User",
			displayName: "테스트유저",
			role: "admin",
		},
		{
			id: "11111111-1111-1111-1111-111111111111",
			email: "kim@example.com",
			name: "Minjun Kim",
			displayName: "김개발",
			role: "user",
		},
		{
			id: "22222222-2222-2222-2222-222222222222",
			email: "lee@example.com",
			name: "Seoyeon Lee",
			displayName: "이디자이너",
			role: "user",
		},
		{
			id: "33333333-3333-3333-3333-333333333333",
			email: "park@example.com",
			name: "Jihoon Park",
			displayName: "박기획",
			role: "user",
		},
		{
			id: "44444444-4444-4444-4444-444444444444",
			email: "choi@example.com",
			name: "Yuna Choi",
			displayName: "최오사카",
			role: "user",
		},
		{
			id: "55555555-5555-5555-5555-555555555555",
			email: "jung@example.com",
			name: "Woojin Jung",
			displayName: "정후쿠오카",
			role: "user",
		},
	];

	for (const u of usersData) {
		await db
			.insert(users)
			.values({
				id: u.id,
				email: u.email,
				password: hashedPassword,
				name: u.name,
				displayName: u.displayName,
				role: u.role as "user" | "admin",
				status: "active",
				emailVerified: new Date(),
			})
			.onConflictDoUpdate({
				target: users.id,
				set: {
					emailVerified: new Date(),
					password: hashedPassword,
					name: u.name,
					displayName: u.displayName,
					role: u.role as "user" | "admin",
				},
			});
	}

	console.log(`✅ Created/Updated ${usersData.length} users`);
	return "00000000-0000-0000-0000-000000000000";
}
