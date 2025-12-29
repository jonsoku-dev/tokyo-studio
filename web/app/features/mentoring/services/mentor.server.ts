import { db } from "@itcom/db/client";
import { mentorProfiles, mentorReviews, users } from "@itcom/db/schema";
import { and, desc, eq, gte, like, sql } from "drizzle-orm";

export interface MentorSearchFilters {
	jobFamily?: string;
	level?: string;
	priceMin?: number;
	priceMax?: number;
	search?: string;
}

export const MentorService = {
	async searchMentors(filters: MentorSearchFilters) {
		const conditions = [eq(mentorProfiles.isActive, true)];

		if (filters.jobFamily) {
			// Basic text match for now, ideally enum or normalized
			conditions.push(like(mentorProfiles.jobTitle, `%${filters.jobFamily}%`));
		}
		if (filters.priceMin !== undefined) {
			conditions.push(gte(mentorProfiles.hourlyRate, filters.priceMin * 100));
		}
		if (filters.priceMax !== undefined) {
			conditions.push(
				sql`${mentorProfiles.hourlyRate} <= ${filters.priceMax * 100}`,
			);
		}
		if (filters.search) {
			conditions.push(
				sql`(${users.name} ILIKE ${`%${filters.search}%`} OR ${mentorProfiles.company} ILIKE ${`%${filters.search}%`})`,
			);
		}

		// Join with users table to get name and avatar
		const results = await db
			.select({
				id: mentorProfiles.id,
				userId: mentorProfiles.userId,
				slug: users.urlSlug, // Using username as slug for now since we don't have separate slug on mentor profile yet, or use profiles slug
				name: users.name,
				avatar: users.avatarUrl, // Assuming imageUrl exists on users from clerk/auth
				company: mentorProfiles.company,
				jobTitle: mentorProfiles.jobTitle,
				yearsOfExperience: mentorProfiles.yearsOfExperience,
				hourlyRate: mentorProfiles.hourlyRate,
				averageRating: mentorProfiles.averageRating,
				totalReviews: mentorProfiles.totalReviews,
				specialties: mentorProfiles.specialties,
			})
			.from(mentorProfiles)
			.innerJoin(users, eq(mentorProfiles.userId, users.id))
			.where(and(...conditions))
			.orderBy(desc(mentorProfiles.updatedAt));

		return results;
	},

	async getMentorProfile(username: string) {
		// Fetch by username (slug)
		const result = await db
			.select({
				profile: mentorProfiles,
				user: users,
			})
			.from(users)
			.innerJoin(mentorProfiles, eq(users.id, mentorProfiles.userId))
			.where(eq(users.urlSlug, username))
			.limit(1);

		if (!result.length) return null;

		return {
			...result[0].profile,
			userId: result[0].user.id, // Explicitly map userId
			slug: result[0].user.urlSlug,
			name: result[0].user.name,
			avatar: result[0].user.avatarUrl,
			// user field is removed to match types
		};
	},

	async getAvailability(_mentorId: string, startDate: Date, _endDate: Date) {
		// 1. Fetch mentor availability settings
		// 2. Fetch existing sessions between dates
		// 3. Compute slots
		// For MVP, enable dummy slots if no settings
		// TODO: Implement real logic.
		// Returning 9-5 slots for next 7 days as placeholder.
		const slots = [];
		const start = new Date(startDate);
		// Simple loop for demo
		for (let d = 0; d < 7; d++) {
			const day = new Date(start);
			day.setDate(day.getDate() + d);
			// 9 AM to 5 PM
			for (let h = 9; h < 17; h++) {
				const slotTime = new Date(day);
				slotTime.setHours(h, 0, 0, 0);
				slots.push({
					startTime: slotTime.toISOString(),
					status: "available", // check against DB sessions here
				});
			}
		}
		return slots;
	},

	async getMentorReviews(mentorId: string, limit = 10) {
		const reviews = await db
			.select({
				id: mentorReviews.id,
				rating: mentorReviews.rating,
				comment: mentorReviews.comment,
				createdAt: mentorReviews.createdAt,
				mentee: {
					id: users.id,
					name: users.name,
					avatarUrl: users.avatarThumbnailUrl,
				},
			})
			.from(mentorReviews)
			.innerJoin(users, eq(mentorReviews.menteeId, users.id))
			.where(eq(mentorReviews.mentorId, mentorId))
			.orderBy(desc(mentorReviews.createdAt))
			.limit(limit);

		return reviews;
	},
};
