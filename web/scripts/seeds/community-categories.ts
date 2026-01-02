import * as schema from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type DB = NodePgDatabase<typeof schema>;

export const COMMUNITY_CATEGORIES = [
	// Tech Stack
	{
		slug: "tech",
		name: "개발/테크 종합",
		icon: "Code2",
		orderIndex: 0,
	},
	{
		slug: "frontend",
		name: "프론트엔드",
		icon: "LayoutTemplate",
		orderIndex: 1,
	},
	{
		slug: "backend",
		name: "백엔드/서버",
		icon: "Server",
		orderIndex: 2,
	},
	{
		slug: "mobile",
		name: "모바일 앱",
		icon: "Smartphone",
		orderIndex: 3,
	},
	{
		slug: "ai-ml",
		name: "AI/머신러닝",
		icon: "BrainCircuit",
		orderIndex: 4,
	},
	{
		slug: "devops",
		name: "DevOps/인프라",
		icon: "Container",
		orderIndex: 5,
	},

	// Career & Business
	{
		slug: "career",
		name: "커리어/이직",
		icon: "Briefcase",
		orderIndex: 10,
	},
	{
		slug: "freelance",
		name: "프리랜서/부업",
		icon: "Coffee",
		orderIndex: 11,
	},
	{
		slug: "startup",
		name: "스타트업/창업",
		icon: "Rocket",
		orderIndex: 12,
	},
	{
		slug: "visa",
		name: "비자/법률",
		icon: "Stamp",
		orderIndex: 13,
	},

	// Life in Japan
	{
		slug: "life",
		name: "일본생활 종합",
		icon: "Globe",
		orderIndex: 20,
	},
	{
		slug: "housing",
		name: "부동산/거주",
		icon: "Home",
		orderIndex: 21,
	},
	{
		slug: "finance",
		name: "금융/재테크",
		icon: "Banknote",
		orderIndex: 22,
	},
    {
		slug: "language",
		name: "일본어 학습",
		icon: "Languages",
		orderIndex: 23,
	},

	// Hobbies & Interests
    {
		slug: "gaming",
		name: "게임/취미",
		icon: "Gamepad2",
		orderIndex: 30,
	},
    {
		slug: "gadgets",
		name: "장비/데스크셋업",
		icon: "Headphones",
		orderIndex: 31,
	},
    {
		slug: "travel",
		name: "여행/맛집",
		icon: "Plane",
		orderIndex: 32,
	},

    // General
	{
		slug: "general",
		name: "자유게시판",
		icon: "MessageSquare",
		orderIndex: 99,
	},
];

export async function seedCommunityCategories(db: DB) {
	console.log("🌱 Seeding Community Categories...");

	for (const category of COMMUNITY_CATEGORIES) {
		const existing = await db.query.communityCategories.findFirst({
			where: eq(schema.communityCategories.slug, category.slug),
		});

		if (!existing) {
			await db.insert(schema.communityCategories).values(category);
		} else {
			await db
				.update(schema.communityCategories)
				.set(category)
				.where(eq(schema.communityCategories.slug, category.slug));
		}
	}

	console.log("✅ Community Categories seeded!");
}
