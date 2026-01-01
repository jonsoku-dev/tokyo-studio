import type * as schema from "@itcom/db/schema";
import { pipelineItems, pipelineStages } from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedPipeline(
	db: NodePgDatabase<typeof schema>,
	userId: string,
) {
	console.log("📝 Seeding pipeline stages...");

	// Clear existing (optional, but good for idempotency if running full seed)
	await db.delete(pipelineItems);
	await db.delete(pipelineStages);

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
	console.log("✅ Seeded 11 pipeline stages");

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
	console.log("✅ Seeded 9 pipeline items");
}
