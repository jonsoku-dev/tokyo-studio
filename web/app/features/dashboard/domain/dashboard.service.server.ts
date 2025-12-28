import { eq } from "drizzle-orm";
import { db } from "~/shared/db/client.server";
import { tasks } from "~/shared/db/schema";
import type { DashboardTask, JobRecommendation } from "./dashboard.types";

const MOCK_JOBS: JobRecommendation[] = [
	{
		id: "j1",
		company: "LINE Yahoo",
		title: "Frontend Engineer (React/TypeScript)",
		location: "Tokyo",
		isVisaSponsored: true,
		tags: ["JLPT N2", "Hybrid"],
	},
	{
		id: "j2",
		company: "Rakuten",
		title: "Full Stack Developer",
		location: "Tokyo",
		isVisaSponsored: true,
		tags: ["English Only", "Remote"],
	},
];

export const dashboardService = {
	getTasks: async (): Promise<DashboardTask[]> => {
		const dbTasks = await db.select().from(tasks).limit(10);

		return dbTasks.map((t) => ({
			id: t.id,
			title: t.title,
			description: t.description,
			category: t.category as any, // In real app, validate enum
			status: t.status as any,
			priority: t.priority as any,
			dueDate: t.dueDate || undefined,
		}));
	},

	updateTaskStatus: async (id: string, status: string) => {
		const [updated] = await db
			.update(tasks)
			.set({ status })
			.where(eq(tasks.id, id))
			.returning();
		return updated;
	},

	getRecommendedJobs: async (): Promise<JobRecommendation[]> => {
		return new Promise((resolve) => setTimeout(() => resolve(MOCK_JOBS), 500));
	},
};
