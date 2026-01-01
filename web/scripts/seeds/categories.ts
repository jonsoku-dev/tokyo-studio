import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { settlementCategories } from "@itcom/db/schema";

type DB = NodePgDatabase<typeof schema>;

const CATEGORIES = [
	{
		slug: "government",
		titleKo: "행정",
		titleJa: "行政",
		icon: "🏛️",
		orderIndex: 0,
	},
	{
		slug: "housing",
		titleKo: "주거",
		titleJa: "住居",
		icon: "🏠",
		orderIndex: 1,
	},
	{
		slug: "finance",
		titleKo: "금융",
		titleJa: "金融",
		icon: "💰",
		orderIndex: 2,
	},
	{
		slug: "telecom",
		titleKo: "통신",
		titleJa: "通信",
		icon: "📱",
		orderIndex: 3,
	},
	{
		slug: "health",
		titleKo: "건강",
		titleJa: "健康",
		icon: "🏥",
		orderIndex: 4,
	},
	{
		slug: "other",
		titleKo: "기타",
		titleJa: "その他",
		icon: "📦",
		orderIndex: 99,
	},
];

export async function seedCategories(db: DB) {
	console.log("🌱 Seeding Settlement Categories...");

	for (const category of CATEGORIES) {
		const existing = await db.query.settlementCategories.findFirst({
			where: eq(schema.settlementCategories.slug, category.slug),
		});

		if (!existing) {
			await db.insert(schema.settlementCategories).values(category);
		} else {
			await db
				.update(schema.settlementCategories)
				.set(category)
				.where(eq(schema.settlementCategories.slug, category.slug));
		}
	}

	console.log("✅ Settlement Categories seeded!");
}
