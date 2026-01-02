import { faker } from "@faker-js/faker";
import * as schema from "@itcom/db/schema";
import { count, eq, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { COMMUNITY_CATEGORIES, seedCommunityCategories } from "./community-categories";

// Default communities to seed
const DEFAULT_COMMUNITIES = [
	{
		slug: "general",
		name: "자유게시판",
		description:
			"일본 IT 취업과 생활에 대한 자유로운 이야기를 나누는 공간입니다.",
	},
	{
		slug: "qna",
		name: "질문답변",
		description:
			"취업 준비, 비자, 생활 등 궁금한 점을 질문하고 답변을 받아보세요.",
	},
	{
		slug: "review",
		name: "취업후기",
		description:
			"일본 IT 기업 면접 경험과 합격/불합격 후기를 공유하는 공간입니다.",
	},
];

export async function seedCommunity(db: NodePgDatabase<typeof schema>) {
	console.log("🌱 Seeding Community...");

	// 1. Get existing users
	const users = await db.select().from(schema.users);
	if (users.length === 0) {
		console.warn("⚠️ No users found. Skipping community seed.");
		return;
	}

	const adminUserId = "00000000-0000-0000-0000-000000000000";

	// 1.5 Seed Categories first
	await seedCommunityCategories(db);
	const dbCategories = await db.select().from(schema.communityCategories);
	const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));


	console.log("  📁 Creating default communities...");
	const communityMap = new Map<string, string>(); // slug -> id

    // Generate communities for ALL categories
    const communitiesList: any[] = [];
    
    for (const cat of COMMUNITY_CATEGORIES) {
        // Always create a main "Hub" community for the category
        communitiesList.push({
            slug: cat.slug === "general" ? "general" 
                 : cat.slug === "tech" ? "tech-general" 
                 : cat.slug === "career" ? "career-general" 
                 : cat.slug === "life" ? "life-general" 
                 : `${cat.slug}-hub`,
            name: `${cat.name} 허브`,
            description: `${cat.name}에 대한 모든 이야기를 나누는 메인 공간입니다.`,
            categorySlug: cat.slug,
             iconUrl: `https://ui-avatars.com/api/?name=${cat.slug}&background=random`
        });

        // Add 3-10 random communities per category
        const numRandom = faker.number.int({ min: 3, max: 10 });
        for (let i = 0; i < numRandom; i++) {
            const topic = faker.word.noun();
            const adjective = faker.word.adjective();
            const uniqueSlug = `${cat.slug}-${adjective}-${topic}`.toLowerCase();
            
             communitiesList.push({
                slug: uniqueSlug,
                name: `${topic} 모임`,
                description: `${cat.name} 분야의 ${topic} 주제에 대해 이야기해보세요. (${adjective})`,
                categorySlug: cat.slug,
                iconUrl: `https://ui-avatars.com/api/?name=${topic}&background=random`
            });
        }
    }
    
    // Add defaults if not covered (though logic above covers general/tech/life/career hubs)
    // We can just rely on the hub logic above.
    // But let's restore specific defaults if they are special.
    // Actually, just ensuring the "main" defaults exist is good enough.

	for (const comm of communitiesList) {
		// Check if community already exists
		const existing = await db
			.select()
			.from(schema.communities)
			.where(eq(schema.communities.slug, comm.slug))
			.limit(1);
        
        const categoryId = categoryMap.get(comm.categorySlug);

		if (existing.length > 0) {
            // Update category if missing
            if (!existing[0].categoryId && categoryId) {
                await db.update(schema.communities).set({ categoryId }).where(eq(schema.communities.id, existing[0].id));
            }
			communityMap.set(comm.slug, existing[0].id);
			console.log(`    ✓ Community "${comm.slug}" already exists`);
		} else {
			const [created] = await db
				.insert(schema.communities)
				.values({
					slug: comm.slug,
					name: comm.name,
					description: comm.description,
					visibility: "public",
					createdBy: adminUserId,
                    categoryId: categoryId,
                    iconUrl: (comm as any).iconUrl || null, 
				})
				.returning();
			communityMap.set(comm.slug, created.id);
			console.log(`    ✓ Created community "${comm.slug}"`);

			// Add admin as owner
			await db.insert(schema.communityMembers).values({
				communityId: created.id,
				userId: adminUserId,
				role: "owner",
			});

			// Add sample rules
			const rules = [
				{
					title: "서로 존중하기",
					description: "다른 멤버들을 존중하고 예의를 지켜주세요.",
				},
				{
					title: "관련 주제만",
					description: "커뮤니티 주제와 관련된 내용만 게시해주세요.",
				},
				{ title: "광고 금지", description: "상업적 광고나 스팸은 삭제됩니다." },
			];
			for (let i = 0; i < rules.length; i++) {
				await db.insert(schema.communityRules).values({
					communityId: created.id,
					orderIndex: i,
					title: rules[i].title,
					description: rules[i].description,
				});
			}
		}
	}

	// 3. Migrate existing posts to use community_id (based on category)
	console.log("  📝 Migrating posts to communities...");
	const postsWithoutCommunity = await db
		.select()
		.from(schema.communityPosts)
		.where(isNull(schema.communityPosts.communityId));

	for (const post of postsWithoutCommunity) {
		// Map category to community slug (general, qna, review)
		const targetSlug = ["general", "qna", "review"].includes(post.category)
			? post.category
			: "general";
		const communityId = communityMap.get(targetSlug);

		if (communityId) {
			await db
				.update(schema.communityPosts)
				.set({ communityId })
				.where(eq(schema.communityPosts.id, post.id));
		}
	}
	console.log(`    ✓ Migrated ${postsWithoutCommunity.length} posts`);

	// 4. Clear and recreate posts/comments for fresh seed
	console.log("  🗑️ Clearing existing posts & comments for fresh seed...");
	await db.delete(schema.communityComments);
	await db.delete(schema.communityPosts);

	// 5. Create Posts with community_id
	const communitySlugs = Array.from(communityMap.keys());
	const posts: (typeof schema.communityPosts.$inferSelect)[] = [];

	for (let i = 0; i < 50; i++) {
		// First 10 posts from Admin for profile activity
		let authorId = adminUserId;
		if (i >= 10) {
			const randomUser = faker.helpers.arrayElement(users);
			authorId = randomUser.id;
		}

		const targetSlug = faker.helpers.arrayElement(communitySlugs);
		const communityId = communityMap.get(targetSlug);
		const createdAt = faker.date.past();

		const [post] = await db
			.insert(schema.communityPosts)
			.values({
				communityId: communityId!,
				title: faker.lorem.sentence(),
				content: faker.lorem.paragraphs(2),
				category: "general", // Deprecated but required
				postType: "text",
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

	// 6. Create Comments
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

	// 7. Update member counts
	for (const [_slug, communityId] of communityMap) {
		const memberCountResult = await db
			.select({ count: count() })
			.from(schema.communityMembers)
			.where(eq(schema.communityMembers.communityId, communityId));

		await db
			.update(schema.communities)
			.set({ memberCount: memberCountResult[0]?.count || 0 })
			.where(eq(schema.communities.id, communityId));
	}

	console.log(
		`✅ Seeded ${posts.length} posts with comments in ${communityMap.size} communities.`,
	);
}
