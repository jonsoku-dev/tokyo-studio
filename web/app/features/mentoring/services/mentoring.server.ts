import { db } from "@itcom/db/client";
import {
	communityComments,
	communityPosts,
	documents,
	mentorAvailabilitySlots,
	mentoringSessions,
	mentorProfiles,
	mentorReviews,
	users,
} from "@itcom/db/schema";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { emailService } from "~/features/auth/services/email.server";
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
				comment: mentorReviews.text,
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
					// SPEC 022: Document Integration - shared documents for mentoring
					sharedDocumentIds: data.sharedDocumentIds || [],
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
				const { notificationOrchestrator } = await import(
					"~/features/notifications/services/orchestrator.server"
				);

				await notificationOrchestrator.trigger({
					type: "mentoring.new_booking",
					userId: mentor.id,
					payload: {
						title: "New Session Booking",
						body: `${mentee.name} has booked a session with you on ${new Date(
							session.date,
						).toLocaleDateString()}`,
						url: "/mentoring/bookings",
						icon: "/icons/calendar.png",
					},
					metadata: {
						sessionId: session.id,
						menteeId: mentee.id,
						menteeName: mentee.name,
						mentorId: mentor.id,
						eventId: session.id,
					},
				});
			}

			return session;
		});
	},

	updateAvailability: async (
		userId: string,
		rules: { day: string; start: string; end: string }[],
	) => {
		return await db.transaction(async (tx) => {
			// 1. Get Mentor ID (profile -> mentor -> or just use userId if mentorId is userId,
			// but schema says mentorAvailabilitySlots uses mentorId which references users.id?
			// Let's check schema. mentorAvailabilitySlots.mentorId references users.id directly?
			// Schema says: mentorId references users.id. So userId is fine.

			// 2. Delete FUTURE UNBOOKED slots
			const now = new Date();
			await tx
				.delete(mentorAvailabilitySlots)
				.where(
					and(
						eq(mentorAvailabilitySlots.mentorId, userId),
						gte(mentorAvailabilitySlots.startTime, now),
						eq(mentorAvailabilitySlots.isBooked, false),
					),
				);

			// 3. Generate Slots for next 30 days
			const slotsToInsert: (typeof mentorAvailabilitySlots.$inferInsert)[] = [];
			const today = new Date();

			// Generate for 4 weeks (28 days)
			for (let i = 0; i < 28; i++) {
				const date = new Date(today);
				date.setDate(today.getDate() + i);
				const dayOfWeek = date.getDay().toString(); // 0-6

				// Find rules for this day
				const dayRules = rules.filter((r) => r.day === dayOfWeek);

				for (const rule of dayRules) {
					// Parse Start
					const [startHour, startMin] = rule.start.split(":").map(Number);
					const slotStart = new Date(date);
					slotStart.setHours(startHour, startMin, 0, 0);

					// Parse End
					const [endHour, endMin] = rule.end.split(":").map(Number);
					const slotEnd = new Date(date);
					slotEnd.setHours(endHour, endMin, 0, 0);

					// Skip if in the past
					if (slotStart < now) continue;

					// Create 30-min slots? or just one big block?
					// The availability schema stores start/end.
					// Let's assume we store the block as defined by user for now,
					// OR break it down if the system expects discrete slots.
					// Booking logic locks a valid slot.
					// If the user defines "09:00 - 18:00", we probably want to break it into chunks
					// OR simply store it and let the booking UI handle slicing.
					// However, typical mentor systems have discrete slots (30m or 60m).
					// Let's break into 30-minute intervals for granularity.

					let current = new Date(slotStart);
					while (current < slotEnd) {
						const next = new Date(current);
						next.setMinutes(current.getMinutes() + 30);

						if (next > slotEnd) break;

						slotsToInsert.push({
							mentorId: userId,
							startTime: new Date(current),
							endTime: new Date(next),
							isBooked: false,
						});

						current = next;
					}
				}
			}

			if (slotsToInsert.length > 0) {
				await tx.insert(mentorAvailabilitySlots).values(slotsToInsert);
			}
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

		// SPEC 022: Fetch shared documents
		const allSharedDocIds = Array.from(
			new Set(results.flatMap((r) => r.session.sharedDocumentIds || [])),
		);

		const docsMap = new Map();
		if (allSharedDocIds.length > 0) {
			const docs = await db
				.select({
					id: documents.id,
					title: documents.title,
					type: documents.type,
					storageKey: documents.storageKey,
				})
				.from(documents)
				.where(inArray(documents.id, allSharedDocIds));

			for (const d of docs) {
				docsMap.set(d.id, d);
			}
		}

		return results.map(({ session, mentor, reviewId }) => ({
			session: {
				...session,
				sharedDocuments: (session.sharedDocumentIds || [])
					.map((id) => docsMap.get(id))
					.filter(Boolean),
			},
			mentor,
			isReviewed: !!reviewId,
		}));
	},

	getMentorCommunityPosts: async (userId: string) => {
		return await db
			.select({
				id: communityPosts.id,
				title: communityPosts.title,
				category: communityPosts.category,
				createdAt: communityPosts.createdAt,
				upvotes: communityPosts.upvotes,
				commentCount: sql<number>`(select count(*) from ${communityComments} where ${communityComments.postId} = ${communityPosts.id})`,
			})
			.from(communityPosts)
			.where(eq(communityPosts.authorId, userId))
			.orderBy(desc(communityPosts.createdAt))
			.limit(5);
	},
};
