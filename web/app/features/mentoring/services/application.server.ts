import { eq } from "drizzle-orm";
import { db } from "@itcom/db/client";
import {
	type InsertMentorApplication,
	mentorApplications,
} from "@itcom/db/schema";
import { storageService } from "~/shared/services/storage.server";

export const applicationService = {
	async hasPendingApplication(userId: string) {
		const existing = await db.query.mentorApplications.findFirst({
			where: eq(mentorApplications.userId, userId),
			orderBy: (apps, { desc }) => [desc(apps.createdAt)],
		});

		// "Pending" or "Under Review" means blocked. "Rejected" allows re-apply after 30 days (check later).
		// For now, simple check: is there an active one?
		if (!existing) return false;
		return (
			existing.status === "pending" || existing.status === "under_review" // "status" field is text, verify enum if enforced
			// If approved, they are already a mentor (role check usually covers this, but app record exists)
		);
	},

	async getApplicationStatus(userId: string) {
		const app = await db.query.mentorApplications.findFirst({
			where: eq(mentorApplications.userId, userId),
			orderBy: (apps, { desc }) => [desc(apps.createdAt)],
		});
		return app;
	},

	async createApplication(data: InsertMentorApplication) {
		// Verify no pending application
		const hasPending = await this.hasPendingApplication(data.userId);
		if (hasPending) {
			throw new Error("You already have a pending application.");
		}

		// Insert
		const [app] = await db
			.insert(mentorApplications)
			.values(data)
			.returning();

		return app;
	},

};
