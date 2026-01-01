/**
 * SPEC 015: Mentor Application Service
 * Handles mentor application workflow: submission → review → approval/rejection
 */

import { db } from "@itcom/db/client";
import {
	adminAuditLogs,
	mentorApplications,
	mentors,
	users,
} from "@itcom/db/schema";
import { and, desc, eq } from "drizzle-orm";

export type ApplicationStatus =
	| "pending"
	| "under_review"
	| "approved"
	| "rejected"
	| "cancelled";

export interface MentorApplicationInput {
	userId: string;
	jobTitle: string;
	company: string;
	yearsOfExperience: number;
	linkedinUrl?: string;
	bio: string;
	expertise: string[]; // ["Frontend", "Backend"]
	languages: Record<string, string>; // { japanese: "N1", english: "Business" }
	hourlyRate: number;
	verificationFileUrl: string; // S3 private bucket key
}

/**
 * Check if user can apply (rate limiting & eligibility)
 */
export async function canUserApply(userId: string): Promise<{
	allowed: boolean;
	reason?: string;
	reapplyDate?: Date;
}> {
	// Check if already has pending/under review application
	const existing = await db.query.mentorApplications.findFirst({
		where: and(
			eq(mentorApplications.userId, userId),
			// Status is pending or under_review
		),
	});

	if (
		existing &&
		(existing.status === "pending" || existing.status === "under_review")
	) {
		return {
			allowed: false,
			reason:
				"You already have a pending application. Please wait for a decision.",
		};
	}

	// Check if rejected and within 30-day cooldown
	const lastRejection = await db.query.mentorApplications.findFirst({
		where: and(
			eq(mentorApplications.userId, userId),
			eq(mentorApplications.status, "rejected"),
		),
		orderBy: desc(mentorApplications.rejectedAt),
	});

	if (lastRejection?.rejectedAt) {
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		if (new Date(lastRejection.rejectedAt) > thirtyDaysAgo) {
			const reapplyDate = new Date(
				new Date(lastRejection.rejectedAt).getTime() + 30 * 24 * 60 * 60 * 1000,
			);
			return {
				allowed: false,
				reason: `You can reapply on ${reapplyDate.toLocaleDateString()}`,
				reapplyDate,
			};
		}
	}

	return { allowed: true };
}

/**
 * Submit a new mentor application
 */
export async function submitApplication(
	input: MentorApplicationInput,
): Promise<{
	id: string;
	status: ApplicationStatus;
}> {
	// Validate input
	if (input.yearsOfExperience < 0 || input.yearsOfExperience > 50) {
		throw new Error("Years of experience must be between 0 and 50");
	}

	if (input.hourlyRate < 3000 || input.hourlyRate > 50000) {
		throw new Error("Hourly rate must be between ¥3,000 and ¥50,000");
	}

	if (input.bio.length < 200 || input.bio.length > 2000) {
		throw new Error("Bio must be between 200 and 2000 characters");
	}

	if (!input.expertise || input.expertise.length === 0) {
		throw new Error("Must select at least one area of expertise");
	}

	// Check eligibility
	const canApply = await canUserApply(input.userId);
	if (!canApply.allowed) {
		throw new Error(canApply.reason);
	}

	// Create application
	const [application] = await db
		.insert(mentorApplications)
		.values({
			userId: input.userId,
			jobTitle: input.jobTitle,
			company: input.company,
			yearsOfExperience: input.yearsOfExperience,
			linkedinUrl: input.linkedinUrl,
			bio: input.bio,
			expertise: input.expertise,
			languages: input.languages,
			hourlyRate: input.hourlyRate,
			verificationFileUrl: input.verificationFileUrl,
			status: "pending",
		})
		.returning();

	return {
		id: application.id,
		status: application.status as ApplicationStatus,
	};
}

/**
 * Get application by ID (with related user data)
 */
export async function getApplication(applicationId: string) {
	const result = await db
		.select({
			application: mentorApplications,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(mentorApplications)
		.leftJoin(users, eq(mentorApplications.userId, users.id))
		.where(eq(mentorApplications.id, applicationId))
		.limit(1);

	return result[0] || null;
}

/**
 * Admin: Get all applications (with filtering)
 */
export async function getApplications(filters?: {
	status?: ApplicationStatus;
	limit?: number;
	offset?: number;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle conditions are complex
	const conditions: any[] = [];

	if (filters?.status) {
		conditions.push(eq(mentorApplications.status, filters.status));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	return await db
		.select({
			application: mentorApplications,
			user: {
				name: users.name,
				email: users.email,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(mentorApplications)
		.leftJoin(users, eq(mentorApplications.userId, users.id))
		.where(whereClause)
		.orderBy(desc(mentorApplications.createdAt))
		.limit(filters?.limit || 20)
		.offset(filters?.offset || 0);
}

/**
 * Admin: Change status to "under_review" when opening detail view
 */
export async function markAsUnderReview(applicationId: string): Promise<void> {
	await db
		.update(mentorApplications)
		.set({
			status: "under_review",
			updatedAt: new Date(),
		})
		.where(eq(mentorApplications.id, applicationId));
}

/**
 * Admin: Approve application (atomic transaction)
 */
export async function approveApplication(
	applicationId: string,
	adminId: string,
): Promise<void> {
	return await db.transaction(async (tx) => {
		// 1. Verify application exists
		const app = await tx.query.mentorApplications.findFirst({
			where: eq(mentorApplications.id, applicationId),
		});

		if (!app) throw new Error("Application not found");

		// 2. Update application status
		await tx
			.update(mentorApplications)
			.set({
				status: "approved",
				reviewedBy: adminId,
				reviewedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(mentorApplications.id, applicationId));

		// 3. Create mentor profile
		const existingMentor = await tx.query.mentors.findFirst({
			where: eq(mentors.userId, app.userId),
		});

		if (!existingMentor) {
			await tx.insert(mentors).values({
				userId: app.userId,
				title: app.jobTitle,
				company: app.company,
				bio: app.bio,
				yearsOfExperience: app.yearsOfExperience.toString(),
				hourlyRate: app.hourlyRate.toString(),
				isApproved: "true", // Mark as approved
			});
		} else {
			// Update existing mentor profile
			await tx
				.update(mentors)
				.set({
					isApproved: "true",
					updatedAt: new Date(),
				})
				.where(eq(mentors.id, existingMentor.id));
		}

		// 4. Log admin action
		await tx.insert(adminAuditLogs).values({
			adminId,
			action: "mentor_approve",
			targetId: applicationId,
			metadata: { application_id: applicationId },
		});

		// TODO: 5. Send approval email to user
		// TODO: 6. Send push notification to user
	});
}

/**
 * Admin: Reject application with reason (atomic transaction)
 */
export async function rejectApplication(
	applicationId: string,
	adminId: string,
	reason: string,
): Promise<void> {
	if (reason.length < 50) {
		throw new Error("Rejection reason must be at least 50 characters");
	}

	return await db.transaction(async (tx) => {
		// 1. Update application
		await tx
			.update(mentorApplications)
			.set({
				status: "rejected",
				rejectionReason: reason,
				rejectedAt: new Date(),
				reviewedBy: adminId,
				reviewedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(mentorApplications.id, applicationId));

		// 2. Log admin action
		await tx.insert(adminAuditLogs).values({
			adminId,
			action: "mentor_reject",
			targetId: applicationId,
			metadata: { reason },
		});

		// TODO: 3. Send rejection email to user with reason
	});
}

/**
 * Admin: Request additional information
 */
export async function requestMoreInfo(
	applicationId: string,
	adminId: string,
	message: string,
): Promise<void> {
	await db
		.update(mentorApplications)
		.set({
			status: "under_review",
			requestedInfoReason: message,
			updatedAt: new Date(),
		})
		.where(eq(mentorApplications.id, applicationId));

	// TODO: Send email to user with request

	// Log action (optional)
	await db.insert(adminAuditLogs).values({
		adminId,
		action: "mentor_request_info",
		targetId: applicationId,
		metadata: { message },
	});
}

/**
 * User: Get their application status
 */
export async function getUserApplicationStatus(userId: string) {
	return await db.query.mentorApplications.findFirst({
		where: eq(mentorApplications.userId, userId),
		orderBy: desc(mentorApplications.createdAt),
	});
}

/**
 * Count pending applications
 */
export async function countPendingApplications(): Promise<number> {
	const [result] = await db
		.select({
			count: count(),
		})
		.from(mentorApplications)
		.where(eq(mentorApplications.status, "pending"));

	return result?.count || 0;
}

// Helper import (if count not directly available, use alternative)
import { count } from "drizzle-orm";
