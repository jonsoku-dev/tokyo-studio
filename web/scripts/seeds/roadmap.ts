import type * as schema from "@itcom/db/schema";
import { tasks } from "@itcom/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedRoadmap(
	db: NodePgDatabase<typeof schema>,
	userId: string,
) {
	console.log("📝 Seeding roadmap tasks...");

	await db.delete(tasks); // Clear existing

	const taskTitles = [
		"Improve Japanese Language Skills",
		"Build Portfolio Projects",
		"Research Japanese IT Companies",
		"Network with Japanese Tech Professionals",
		"Optimize Resume for Japanese Market",
		"Prepare for Technical Interviews",
		"Study Cloud Architecture",
		"Review System Design Patterns",
	];

	const taskDescriptions = [
		"Focus on business Japanese and IT terminology. Target N2 level.",
		"Create 2-3 portfolio projects showcasing backend and DevOps skills.",
		"Compile list of 50+ target companies and analyze them.",
		"Attend tech meetups and build connections on LinkedIn.",
		"Rewrite resume highlighting relevant skills and experience.",
		"Review algorithms, system design, and company-specific problems.",
		"Deep dive into AWS, GCP, and Azure services.",
		"Study microservices, distributed systems, and scalability.",
	];

	const taskStatuses = ["pending", "in_progress", "completed"] as const;
	const taskPriorities = ["urgent", "normal"] as const;

	const taskData = Array.from({ length: 6 }, (_, i) => {
		const daysOffset = i % 2 === 0 ? 60 : -30;
		const days = Math.floor(Math.random() * Math.abs(daysOffset));
		const actualDays = daysOffset > 0 ? days : -days;

		return {
			title: taskTitles[i % taskTitles.length],
			description: taskDescriptions[i % taskDescriptions.length],
			category: "Roadmap",
			status: taskStatuses[i % taskStatuses.length],
			priority: taskPriorities[i % taskPriorities.length],
			dueDate: new Date(Date.now() + actualDays * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			userId,
		};
	});

	await db.insert(tasks).values(taskData);
	console.log("✅ Seeded 6 roadmap tasks");
}
