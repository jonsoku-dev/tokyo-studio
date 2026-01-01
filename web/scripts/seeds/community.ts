import { faker } from "@faker-js/faker";
import * as schema from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedCommunity(db: NodePgDatabase<typeof schema>) {
	console.log("🌱 Seeding Community...");

	// 1. Get existing users
	const users = await db.select().from(schema.users);
	if (users.length === 0) {
		console.warn("⚠️ No users found. Skipping community seed.");
		return;
	}

	// 2. Clear existing community data
	await db.delete(schema.communityComments);
	await db.delete(schema.communityPosts);

	// 3. Create Posts
	const categories = ["general", "qna", "review", "tips", "news"];
	const posts: (typeof schema.communityPosts.$inferSelect)[] = [];
	const adminUserId = "00000000-0000-0000-0000-000000000000";

	for (let i = 0; i < 50; i++) {
		// First 10 posts are from Admin (Mentor) to ensure profile activity
		let authorId = adminUserId;
		
		// For the rest, pick a random user (excluding admin if desired, or mixed)
		if (i >= 10) {
			const randomUser = faker.helpers.arrayElement(users);
			authorId = randomUser.id;
		}

		const category = faker.helpers.arrayElement(categories);
		const createdAt = faker.date.past();

		const [post] = await db
			.insert(schema.communityPosts)
			.values({
				title: faker.lorem.sentence(),
				content: faker.lorem.paragraphs(2),
				category,
				authorId: authorId,
				upvotes: faker.number.int({ min: 0, max: 100 }),
				downvotes: faker.number.int({ min: 0, max: 10 }),
				score: faker.number.int({ min: 0, max: 100 }),
				createdAt,
				updatedAt: createdAt,
			})
			.returning();

		posts.push(post);
	}

	// 4. Create Comments
	for (const post of posts) {
		const commentCount = faker.number.int({ min: 0, max: 15 });

		for (let j = 0; j < commentCount; j++) {
			const author = faker.helpers.arrayElement(users);
			const createdAt = faker.date.between({
				from: post.createdAt || new Date(),
				to: new Date(),
			});

			await db.insert(schema.communityComments).values({
				postId: post.id,
				content: faker.lorem.sentence(),
				authorId: author.id,
				upvotes: faker.number.int({ min: 0, max: 20 }),
				createdAt,
				updatedAt: createdAt,
			});
		}
	}

	console.log(`✅ Seeded ${posts.length} posts with comments.`);
}
