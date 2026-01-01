import type * as schema from "@itcom/db/schema";
import { settlementPhases } from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedPhases(db: NodePgDatabase<typeof schema>) {
	console.log("📝 Seeding settlement phases...");

	await db.delete(settlementPhases);

	// Standard Phases based on "Time Phase" concepts
	const phases = [
		{
			title: "Pre-departure",
			titleKo: "출국 전 (준비기)",
			titleJa: "出国前（準備期）",
			titleEn: "Pre-departure",
			description: "한국에서 미리 준비해야 할 필수 항목들입니다.",
			minDays: -9999,
			maxDays: -1,
			orderIndex: 0,
		},
		{
			title: "First Week",
			titleKo: "입국 1주차 (정착기)",
			titleJa: "入国1週間（手続期）",
			titleEn: "First Week",
			description: "입국 직후 가장 시급하게 처리해야 할 행정/생활 업무입니다.",
			minDays: 0,
			maxDays: 7,
			orderIndex: 1,
		},
		{
			title: "First Month",
			titleKo: "입국 1개월 내 (적응기)",
			titleJa: "入国1ヶ月（適応期）",
			titleEn: "First Month",
			description: "생활 기반을 다지고 일본 생활에 익숙해지는 시기입니다.",
			minDays: 8,
			maxDays: 30,
			orderIndex: 2,
		},
		{
			title: "After 3 Months",
			titleKo: "3개월 이후 (안정기)",
			titleJa: "3ヶ月以降（安定期）",
			titleEn: "After 3 Months",
			description: "장기적인 관점에서 챙겨야 할 건강검진, 세금, 연금 등입니다.",
			minDays: 31,
			maxDays: 9999,
			orderIndex: 3,
		},
	];

	await db.insert(settlementPhases).values(phases);
	console.log(`✅ Seeded ${phases.length} settlement phases`);
}
