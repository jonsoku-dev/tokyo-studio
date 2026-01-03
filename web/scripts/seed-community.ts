/**
 * Seed Community Only (Lightweight)
 *
 * 커뮤니티 데이터만 따로 시드하는 스크립트입니다.
 * - 카테고리당 2~3개의 커뮤니티 생성
 * - 커뮤니티당 2~5개의 포스트 생성
 * - 포스트당 0~3개의 댓글 생성
 *
 * Usage: pnpm db:seed:community
 */

import { fakerKO as faker } from "@faker-js/faker";
import * as schema from "@itcom/db/schema";
import { config } from "dotenv";
import { count, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	COMMUNITY_CATEGORIES,
	seedCommunityCategories,
} from "./seeds/community-categories";

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

// --- Lightweight Data Types ---
interface SeedPost {
	title: string;
	content: string;
	category: string;
	authorEmail?: string;
	comments: { content: string; authorEmail?: string }[];
}

interface SeedCommunity {
	slug: string;
	name: string;
	description: string;
	categorySlug: string;
	ownerEmail?: string;
	iconUrl?: string;
	posts: SeedPost[];
}

// --- Core Hand-crafted Communities (Minimal Set) ---
const CORE_COMMUNITIES: SeedCommunity[] = [
	// Tech > Frontend
	{
		slug: "react-users",
		name: "React & Next.js 모임",
		description: "React, Next.js, 생태계 동향을 공유하는 모임입니다.",
		categorySlug: "frontend",
		ownerEmail: "kim@example.com",
		posts: [
			{
				title: "Next.js 14 App Router 도입 후기",
				content:
					"App Router를 도입해봤는데, Server Component 개념 잡는게 어렵네요. 하지만 성능은 확실히 좋아졌습니다.",
				category: "tech",
				authorEmail: "kim@example.com",
				comments: [
					{
						content: "저도 마이그레이션 고민 중인데 도움 되네요!",
						authorEmail: "lee@example.com",
					},
					{
						content: "RSC 디버깅이 어렵더라고요 ㅠㅠ",
						authorEmail: "park@example.com",
					},
				],
			},
		],
	},
	// Tech > Backend
	{
		slug: "spring-boot-korea",
		name: "Spring Boot 개발자",
		description: "자바/스프링 백엔드 개발자들을 위한 공간입니다.",
		categorySlug: "backend",
		ownerEmail: "kim@example.com",
		posts: [
			{
				title: "JPA N+1 문제 해결 경험 공유",
				content: "Fetch Join으로 해결했는데, QueryDSL이 더 좋을까요?",
				category: "tech",
				authorEmail: "kim@example.com",
				comments: [
					{
						content: "QueryDSL이 정신건강에 좋습니다.",
						authorEmail: "choi@example.com",
					},
				],
			},
		],
	},
	// Career
	{
		slug: "tokyo-dev-career",
		name: "도쿄 개발자 커리어",
		description: "도쿄 지역 개발자들의 이직, 연봉, 커리어 고민 상담소",
		categorySlug: "career",
		ownerEmail: "park@example.com",
		posts: [
			{
				title: "3년차 백엔드 개발자 연봉 600만엔 적정한가요?",
				content:
					"도쿄 거주 기준 생활비 생각하면 적정한 수준인지 감이 안 오네요.",
				category: "career",
				authorEmail: "park@example.com",
				comments: [
					{
						content: "3년차 600이면 나쁘지 않은 시작입니다.",
						authorEmail: "kim@example.com",
					},
				],
			},
		],
	},
	// Life > Housing
	{
		slug: "tokyo-housing",
		name: "도쿄 집구하기",
		description: "야칭, 보증회사, 이사 팁 공유",
		categorySlug: "housing",
		ownerEmail: "choi@example.com",
		posts: [
			{
				title: "UR공단주택 들어가고 싶은데 대기가 기네요",
				content: "레이킹/시키킴 없고 보증인 필요 없어서 UR 알아보고 있습니다.",
				category: "general",
				authorEmail: "choi@example.com",
				comments: [
					{
						content: "매일 아침 9시에 사이트 새로고침 하는 수밖에 없어요 ㅠㅠ",
						authorEmail: "park@example.com",
					},
				],
			},
		],
	},
	// Life > General
	{
		slug: "life-in-japan",
		name: "슬기로운 일본생활",
		description: "일본 생활 꿀팁, 맛집, 일상 이야기",
		categorySlug: "life",
		ownerEmail: "lee@example.com",
		posts: [
			{
				title: "편의점 오뎅 시즌이 돌아왔네요 🍢",
				content: "퇴근길에 세븐일레븐 들려서 오뎅 사먹었는데 맛있네요!",
				category: "general",
				authorEmail: "lee@example.com",
				comments: [
					{
						content: "저는 소세지랑 실곤약이요!",
						authorEmail: "choi@example.com",
					},
				],
			},
		],
	},
];

// Category Topics for Generated Communities
const CATEGORY_TOPICS: Record<string, string[]> = {
	frontend: ["React", "Vue", "TypeScript"],
	backend: ["Spring", "Node.js", "Go"],
	mobile: ["iOS", "Android", "Flutter"],
	"ai-ml": ["ChatGPT", "LLM", "딥러닝"],
	devops: ["AWS", "Docker", "Kubernetes"],
	career: ["이직", "연봉", "면접"],
	freelance: ["프리랜서", "계약", "세금"],
	startup: ["창업", "투자", "팀빌딩"],
	visa: ["취업비자", "영주권", "귀화"],
	life: ["맛집", "쇼핑", "일상"],
	housing: ["야칭", "이사", "동네추천"],
	finance: ["NISA", "환율", "적금"],
	language: ["JLPT", "비즈니스일본어", "회화"],
	gaming: ["PS5", "Switch", "Steam"],
	gadgets: ["키보드", "모니터", "아이폰"],
	travel: ["온천", "료칸", "등산"],
	general: ["자유수다", "고민상담", "유머"],
};

async function seedCommunityOnly(db: NodePgDatabase<typeof schema>) {
	console.log("🌱 Seeding Community (Lightweight)...\n");

	// 1. Get existing users
	const users = await db.select().from(schema.users);
	if (users.length === 0) {
		console.error(
			"❌ No users found. Please run db:seed first to create users.",
		);
		process.exit(1);
	}

	const userMap = new Map<string, string>();
	const userEmails = users.map((u) => u.email);
	for (const u of users) {
		userMap.set(u.email, u.id);
	}

	const fallbackUserId = userMap.get("test@example.com") || users[0].id;

	// 2. Cleanup community data only
	console.log("🗑️ Cleaning up existing community data...");
	await db.delete(schema.commentNotifications);
	await db.delete(schema.voteAuditLogs);
	await db.delete(schema.reputationLogs);
	await db.delete(schema.commentVotes);
	await db.delete(schema.postVotes);
	await db.delete(schema.communityComments);
	await db.delete(schema.communityPosts);
	await db.delete(schema.communityRules);
	await db.delete(schema.communityMembers);
	await db.delete(schema.communities);
	await db.delete(schema.communityCategories);

	// 3. Seed Categories
	await seedCommunityCategories(db);
	const dbCategories = await db.select().from(schema.communityCategories);
	const categoryMap = new Map(dbCategories.map((c) => [c.slug, c.id]));

	console.log("📁 Creating communities...");
	const communityMap = new Map<string, string>();

	// Combine Core + Generated (Lightweight)
	const allCommunities: SeedCommunity[] = [...CORE_COMMUNITIES];

	// Generate 1-2 additional communities per category
	for (const cat of COMMUNITY_CATEGORIES) {
		const topics = CATEGORY_TOPICS[cat.slug] || ["일반"];
		const coreCount = CORE_COMMUNITIES.filter(
			(c) => c.categorySlug === cat.slug,
		).length;

		// Target: 2~3 communities per category (lightweight)
		const targetCount = faker.number.int({ min: 2, max: 3 });
		const needed = Math.max(0, targetCount - coreCount);

		const shuffledTopics = faker.helpers.shuffle(topics);

		for (let i = 0; i < needed; i++) {
			const topic = shuffledTopics[i % shuffledTopics.length];
			const adjective = faker.helpers.arrayElement([
				"즐거운",
				"함께하는",
				"열정적인",
			]);

			const randomOwnerEmail = faker.helpers.arrayElement(
				userEmails.filter((e) => e !== "test@example.com"),
			);

			const slug =
				`${cat.slug}-${topic.replace(/\//g, "-").replace(/\s+/g, "-")}-${i}`.toLowerCase();

			// Generate 2~5 posts (lightweight)
			const numPosts = faker.number.int({ min: 2, max: 5 });
			const generatedPosts: SeedPost[] = [];

			for (let j = 0; j < numPosts; j++) {
				const postTopic = faker.helpers.arrayElement(topics);
				const title = faker.helpers.arrayElement([
					`${postTopic} 질문있습니다`,
					`${postTopic} 관련 공유`,
					`${postTopic} 꿀팁`,
				]);

				const content = faker.lorem.paragraph();

				generatedPosts.push({
					title,
					content,
					category: "general",
					authorEmail: faker.helpers.arrayElement(userEmails),
					comments: Array.from({
						length: faker.number.int({ min: 0, max: 3 }),
					}).map(() => ({
						content: faker.lorem.sentence(),
						authorEmail: faker.helpers.arrayElement(userEmails),
					})),
				});
			}

			allCommunities.push({
				slug,
				name: `${topic} ${adjective} 모임`,
				description: `${cat.name} 카테고리의 ${topic} 주제를 다루는 커뮤니티입니다.`,
				categorySlug: cat.slug,
				ownerEmail: randomOwnerEmail,
				iconUrl: `https://ui-avatars.com/api/?name=${topic}&background=random&color=fff&length=2`,
				posts: generatedPosts,
			});
		}
	}

	// 4. Create All Communities
	let communityIndex = 0;
	for (const commData of allCommunities) {
		communityIndex++;
		const categoryId = categoryMap.get(commData.categorySlug);

		const ownerId = commData.ownerEmail
			? userMap.get(commData.ownerEmail) || fallbackUserId
			: fallbackUserId;

		const iconUrl =
			commData.iconUrl ||
			`https://ui-avatars.com/api/?name=${commData.slug}&background=random&color=fff`;

		let communityId: string;
		try {
			const [created] = await db
				.insert(schema.communities)
				.values({
					slug: commData.slug,
					name: commData.name,
					description: commData.description,
					visibility: "public",
					createdBy: ownerId,
					categoryId: categoryId,
					iconUrl: iconUrl,
					memberCount: 0,
				})
				.onConflictDoNothing()
				.returning();

			if (created) {
				communityId = created.id;
			} else {
				const [existing] = await db
					.select()
					.from(schema.communities)
					.where(eq(schema.communities.slug, commData.slug));
				if (!existing) continue;
				communityId = existing.id;
			}
		} catch (e) {
			console.error(`Failed to create community ${commData.slug}`, e);
			continue;
		}

		console.log(
			`  ✓ ${communityIndex}/${allCommunities.length}: ${commData.name}`,
		);

		// Add Owner as member
		await db
			.insert(schema.communityMembers)
			.values({
				communityId,
				userId: ownerId,
				role: "owner",
			})
			.onConflictDoNothing();

		communityMap.set(commData.slug, communityId);

		// 5. Create Posts
		for (const postData of commData.posts) {
			const authorId = postData.authorEmail
				? userMap.get(postData.authorEmail) || fallbackUserId
				: faker.helpers.arrayElement(Array.from(userMap.values()));

			const createdAt = faker.date.recent({ days: 30 });
			const [newPost] = await db
				.insert(schema.communityPosts)
				.values({
					communityId,
					title: postData.title,
					content: postData.content,
					category: postData.category,
					postType: "text",
					authorId,
					upvotes: faker.number.int({ min: 0, max: 30 }),
					downvotes: faker.number.int({ min: 0, max: 5 }),
					score: faker.number.int({ min: 0, max: 30 }),
					createdAt,
					updatedAt: createdAt,
				})
				.returning();

			// 6. Create Comments
			if (newPost) {
				for (const commentData of postData.comments) {
					const commentAuthorId = commentData.authorEmail
						? userMap.get(commentData.authorEmail) || fallbackUserId
						: faker.helpers.arrayElement(Array.from(userMap.values()));
					const commentCreatedAt = faker.date.between({
						from: createdAt,
						to: new Date(),
					});

					await db.insert(schema.communityComments).values({
						postId: newPost.id,
						content: commentData.content,
						authorId: commentAuthorId,
						upvotes: faker.number.int({ min: 0, max: 10 }),
						createdAt: commentCreatedAt,
						updatedAt: commentCreatedAt,
					});
				}
			}
		}
	}

	// 7. Update member counts
	console.log("\n📊 Updating member counts...");
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
		`\n✅ Seeded ${allCommunities.length} communities (lightweight)!`,
	);
}

// Run seed
async function main() {
	try {
		await seedCommunityOnly(db);
		process.exit(0);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
