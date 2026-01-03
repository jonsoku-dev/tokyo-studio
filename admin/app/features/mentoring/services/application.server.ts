import { db } from "@itcom/db/client";
import {
	adminAuditLogs,
	type InsertMentorApplication,
	mentorApplications,
	mentorProfiles,
	users,
} from "@itcom/db/schema";
import { eq } from "drizzle-orm";

export const applicationService = {
	async getApplications() {
		return db.query.mentorApplications.findMany({
			with: {
				user: true,
			},
			orderBy: (apps, { desc }) => [desc(apps.createdAt)],
		});
	},

	async processApplication(
		adminId: string,
		applicationId: string,
		decision: "approved" | "rejected",
		rejectionReason?: string,
	) {
		return db.transaction(async (tx) => {
			const app = await tx.query.mentorApplications.findFirst({
				where: eq(mentorApplications.id, applicationId),
			});
			if (!app) throw new Error("Application not found");
			if (app.status !== "pending" && app.status !== "under_review") {
				throw new Error("Application is already processed");
			}

			// 1. Update Application Status
			await tx
				.update(mentorApplications)
				.set({
					status: decision,
					rejectionReason: decision === "rejected" ? rejectionReason : null,
					reviewedBy: adminId,
					reviewedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(mentorApplications.id, applicationId));

			// 2. Audit Log
			await tx.insert(adminAuditLogs).values({
				adminId,
				action: `mentor_${decision}`,
				targetId: applicationId,
				metadata: { reason: rejectionReason },
			});

			// 3. If Approved, Upgrade User Role & Create Profile
			if (decision === "approved") {
				// Upgrade Role
				await tx
					.update(users)
					.set({ role: "mentor" }) // Ensure 'mentor' role exists in enum or text
					.where(eq(users.id, app.userId));

				// Create Mentor Profile (if not exists)
				// Check existing?
				const existingProfile = await tx.query.mentorProfiles.findFirst({
					where: eq(mentorProfiles.userId, app.userId),
				});

				if (!existingProfile) {
					await tx.insert(mentorProfiles).values({
						userId: app.userId,
						jobTitle: app.jobTitle, // Correct property name
						company: app.company,
						bio: app.bio,
						experienceYears: app.yearsOfExperience,
						linkedinUrl: app.linkedinUrl || undefined,
						// Default values
						hourlyRate: 3000,
						currency: "JPY",
						specialties: app.expertise,
						languages: app.languages,
					} as any);
				}
			}

			// 4. Send Email (Mocked for now)
			// await emailService.sendApplicationStatusEmail(app.userId, decision, rejectionReason);

			return { success: true };
		});
	},
};
