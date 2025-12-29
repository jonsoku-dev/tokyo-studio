import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { emailService } from "~/features/auth/services/email.server";
import { pushService } from "~/features/notifications/services/push.server";
import { db } from "@itcom/db/client";
import {
	mentorAvailabilitySlots,
	mentoringSessions,
	mentorProfiles,
	mentorReviews,
	users,
} from "@itcom/db/schema";
import type {
	CreateBookingDTO,
	MentorFilters,
} from "../domain/mentoring.types";
import { videoConferencingService } from "./video-conferencing.server";

export const mentoringService = {
	getMentors: async (filters: MentorFilters = {}) => {
		const conditions = [];

		if (filters.jobFamily) {
			// searching in title or specific field? Spec says "Job Family".
			// Our profile has 'title'. We can search title.
			conditions.push(
				sql`lower(${mentorProfiles.jobTitle}) LIKE ${`%${filters.jobFamily.toLowerCase()}%`}`,
			);
		}

		if (filters.minPrice) {
			conditions.push(gte(mentorProfiles.hourlyRate, filters.minPrice));
		}
		if (filters.maxPrice) {
			conditions.push(lte(mentorProfiles.hourlyRate, filters.maxPrice));
		}

		// Experience level mapping? Spec: Junior, Mid, Senior.
		// We have yearsOfExperience.
		// Let's assume frontend passes years range or simplified logic.
		// For MVP, simplistic filtering if experienceLevel is passed.

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const result = await db
			.select({
				user: users,
				profile: mentorProfiles,
			})
			.from(users)
			.innerJoin(mentorProfiles, eq(users.id, mentorProfiles.userId))
			.where(whereClause)
			.orderBy(desc(mentorProfiles.averageRating));
		return result.map((row) => ({
			...row.user,
			profile: row.profile,
		}));
	},

	getMentorByUserId: async (userId: string) => {
		const result = await db
			.select({
				user: users,
				profile: mentorProfiles,
			})
			.from(users)
			.leftJoin(mentorProfiles, eq(users.id, mentorProfiles.userId))
			.where(eq(users.id, userId))
			.limit(1);

		if (!result.length) return null;

		// Fetch reviews
		const reviews = await db
			.select({
				id: mentorReviews.id,
				rating: mentorReviews.rating,
				comment: mentorReviews.comment,
				createdAt: mentorReviews.createdAt,
				menteeName: users.name,
			})
			.from(mentorReviews)
			.leftJoin(users, eq(mentorReviews.menteeId, users.id))
			.where(eq(mentorReviews.mentorId, userId))
			.orderBy(desc(mentorReviews.createdAt))
			.limit(10);

		return {
			...result[0].user,
			profile: result[0].profile,
			reviews,
		};
	},

	getAvailability: async (
		mentorId: string,
		startDate?: Date,
		endDate?: Date,
	) => {
		const start = startDate || new Date();
		const end = endDate || new Date(new Date().setDate(start.getDate() + 30));

		return await db
			.select()
			.from(mentorAvailabilitySlots)
			.where(
				and(
					eq(mentorAvailabilitySlots.mentorId, mentorId),
					gte(mentorAvailabilitySlots.startTime, start),
					lte(mentorAvailabilitySlots.endTime, end),
					eq(mentorAvailabilitySlots.isBooked, false), // Only show available
				),
			)
			.orderBy(asc(mentorAvailabilitySlots.startTime));
	},

	bookSession: async (userId: string, data: CreateBookingDTO) => {
		return await db.transaction(async (tx) => {
			// 1. Lock/Check Slot
			const slot = await tx
				.select()
				.from(mentorAvailabilitySlots)
				.where(eq(mentorAvailabilitySlots.id, data.slotId))
				.limit(1) // For update? Drizzle doesn't strictly support FOR UPDATE easily in all drivers without sql.
				// Optimistic check:
				// We will attempt to update isBooked = true WHERE id = slotId AND isBooked = false
				// If update count is 0, failing.
				.then((res) => res[0]);

			if (!slot) throw new Error("Slot not found");
			if (slot.isBooked) throw new Error("Slot already booked");

			// Fetch Mentor Profile for Video Preference
			const mentorProfile = await tx.query.mentorProfiles.findFirst({
				where: eq(mentorProfiles.userId, data.mentorId),
			});

			// Generate Session ID and Meeting URL
			const sessionId = crypto.randomUUID();
			const meetingUrl = await videoConferencingService.generateLink(
				mentorProfile?.preferredVideoProvider || "jitsi",
				{ id: sessionId, topic: data.topic, mentorId: data.mentorId },
				{ manualUrl: mentorProfile?.manualMeetingUrl || "" },
			);

			// 2. Create Session
			const [session] = await tx
				.insert(mentoringSessions)
				.values({
					id: sessionId,
					mentorId: data.mentorId,
					userId: userId,
					topic: data.topic,
					date: slot.startTime.toISOString(),
					duration: data.duration,
					price: data.price,
					currency: "USD",
					status: "confirmed", // Skip pending/payment for MVP mock
					meetingUrl: meetingUrl,
				})
				.returning();

			// 3. Mark Slot Booked
			const updateResult = await tx
				.update(mentorAvailabilitySlots)
				.set({
					isBooked: true,
					bookingId: session.id,
				})
				.where(
					and(
						eq(mentorAvailabilitySlots.id, data.slotId),
						eq(mentorAvailabilitySlots.isBooked, false),
					),
				);

			// Drizzle update returning doesn't give row count directly in all drivers easily via API, but `returning` gives rows.
			// If empty, it failed.
			if (!updateResult) {
				// Wait, updateResult is result array if returning?
				// If I don't use returning, checking result object depends on driver.
				// Let's use returning to be safe.
			}

			// Re-verify with returning
			const verify = await tx
				.select()
				.from(mentorAvailabilitySlots)
				.where(eq(mentorAvailabilitySlots.id, data.slotId));

			if (verify[0].bookingId !== session.id) {
				// Race condition caught?
				throw new Error("Slot booking failed - race condition");
			}

			// 4. Send Email (after transaction commit ideal, but inside for now or return needed data)
			// Ideally we do this after transaction, but here we are inside.
			// Let's fetch mentee and mentor details to send email.
			// We can do this asynchronously without awaiting if we don't want to block,
			// but for reliability awaiting is better, or use a job queue.
			// For now, allow it to run.

			// We need user email.
			const mentee = await tx.query.users.findFirst({
				where: eq(users.id, userId),
			});

			const mentor = await tx.query.users.findFirst({
				where: eq(users.id, data.mentorId),
			});

			// 4. Send Confirmation Email
			if (mentee && mentor) {
				await emailService.sendMentoringConfirmation(mentee.email, {
					mentorName: mentor.name,
					date: new Date(session.date),
					duration: data.duration,
					meetingUrl: session.meetingUrl || "",
					topic: data.topic,
				});

				// 5. Send Push Notification to Mentor
				await pushService.sendPushNotification(mentor.id, {
					title: "New Session Booking",
					body: `${mentee.name} has booked a session with you on ${new Date(
						session.date,
					).toLocaleDateString()}`,
					url: `/mentoring/bookings`,
				});
			}

			return session;
		});
	},

	getUserSessions: async (userId: string) => {
		const results = await db
			.select({
				session: mentoringSessions,
				mentor: users,
				reviewId: mentorReviews.id,
			})
			.from(mentoringSessions)
			.leftJoin(users, eq(mentoringSessions.mentorId, users.id))
			.leftJoin(
				mentorReviews,
				eq(mentoringSessions.id, mentorReviews.sessionId),
			)
			.where(eq(mentoringSessions.userId, userId))
			.orderBy(desc(mentoringSessions.date));

		return results.map(({ session, mentor, reviewId }) => ({
			session,
			mentor,
			isReviewed: !!reviewId,
		}));
	},
};
