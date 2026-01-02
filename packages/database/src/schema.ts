import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	customType,
	index,
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const tsvector = customType<{ data: string }>({
	dataType() {
		return "tsvector";
	},
});

// --- Users ---
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	password: text("password"), // Nullable for social auth users
	name: text("name").notNull(),
	displayName: text("display_name"),
	role: text("role").default("user"), // "user" | "admin"
	status: text("status").default("active"), // "active" | "suspended"
	avatarUrl: text("avatar_url"),
	avatarThumbnailUrl: text("avatar_thumbnail_url"),
	urlSlug: text("url_slug").unique(),
	googleId: text("google_id").unique(),
	githubId: text("github_id").unique(),
	kakaoId: text("kakao_id").unique(),
	lineId: text("line_id").unique(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	emailVerified: timestamp("email_verified"),
	reputation: integer("reputation").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = InferSelectModel<typeof users>;

// --- Verification Tokens ---
export const verificationTokens = pgTable("verification_tokens", {
	id: uuid("id").primaryKey().defaultRandom(),
	token: text("token").notNull().unique(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertVerificationTokenSchema =
	createInsertSchema(verificationTokens);
export const selectVerificationTokenSchema =
	createSelectSchema(verificationTokens);

// --- Password Reset Tokens ---
export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: uuid("id").primaryKey().defaultRandom(),
	token: text("token").notNull().unique(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema =
	createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema =
	createSelectSchema(passwordResetTokens);

// --- Tasks (Dashboard) ---
export const tasks = pgTable("tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(), // "Roadmap" | "Settle Tokyo" | "Job Hunt"
	status: text("status").default("pending"), // "pending" | "completed"
	priority: text("priority").default("normal"), // "urgent" | "normal"
	dueDate: text("due_date"),
	userId: uuid("user_id").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

// --- Pipeline Stages (Configurable stages for the hiring pipeline) ---
export const pipelineStages = pgTable("pipeline_stages", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(), // "interested", "applied", "interview_1", etc.
	displayName: text("display_name").notNull(), // "Interested", "Applied", "Interview 1", etc.
	orderIndex: integer("order_index").notNull(), // Order in kanban board
	isActive: boolean("is_active").notNull().default(true),
	color: text("color"), // Optional: color for UI
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineStageSchema = createInsertSchema(pipelineStages);
export const selectPipelineStageSchema = createSelectSchema(pipelineStages);
export type PipelineStage = InferSelectModel<typeof pipelineStages>;

// --- Pipeline Items ---
export const pipelineItems = pgTable("pipeline_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	company: text("company").notNull(),
	position: text("position").notNull(),
	stage: text("stage").notNull(), // References pipelineStages.name
	date: text("date").notNull(),
	nextAction: text("next_action"),
	orderIndex: integer("order_index").notNull().default(0), // Order within stage column
	userId: uuid("user_id").references(() => users.id),
	// Document Integration: Resume attached to this application
	resumeId: uuid("resume_id").references(() => documents.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineItemSchema = createInsertSchema(pipelineItems);
export const selectPipelineItemSchema = createSelectSchema(pipelineItems);

// --- Documents ---
export const documents = pgTable(
	"documents",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(), // User-friendly name - NOT NULL constraint
		type: text("type").notNull(), // "Resume" | "CV" | "Portfolio" | "Cover Letter"
		status: text("status").default("draft").notNull(), // "draft" | "final" | "pending" | "uploaded" | "deleted"
		url: text("url"), // Public/Presigned URL

		// File Metadata
		storageKey: text("storage_key"), // S3 Key / Local Path
		s3Key: text("s3_key"), // S3 specific key
		thumbnailS3Key: text("thumbnail_s3_key"), // S3 thumbnail key
		originalName: text("original_name"),
		mimeType: text("mime_type"),
		size: text("size"), // Storing as text to avoid BigInt issues, convert to number in app
		thumbnailUrl: text("thumbnail_url"),
		downloadCount: text("download_count").default("0"),

		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		uploadedAt: timestamp("uploaded_at"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		// CHECK constraints for enum values
		statusCheck: check(
			"documents_status_check",
			sql`${table.status} IN ('draft', 'final', 'pending', 'uploaded', 'deleted')`,
		),
		typeCheck: check(
			"documents_type_check",
			sql`${table.type} IN ('Resume', 'CV', 'Portfolio', 'Cover Letter')`,
		),
		// Composite indexes for performance
		userUploadedAtIdx: index("documents_user_uploaded_at_idx").on(
			table.userId,
			table.uploadedAt,
		),
		userStatusIdx: index("documents_user_status_idx").on(
			table.userId,
			table.status,
		),
	}),
);

export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);

// --- Document Versions ---
export const documentVersions = pgTable(
	"document_versions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		documentId: uuid("document_id")
			.references(() => documents.id, { onDelete: "cascade" })
			.notNull(),
		changeType: text("change_type").notNull(), // "upload", "rename", "status_change"
		oldValue: text("old_value"),
		newValue: text("new_value"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		// CHECK constraint for changeType enum
		changeTypeCheck: check(
			"document_versions_change_type_check",
			sql`${table.changeType} IN ('upload', 'rename', 'status_change')`,
		),
		// Index for querying version history by document
		documentCreatedAtIdx: index("document_versions_document_created_at_idx").on(
			table.documentId,
			table.createdAt,
		),
	}),
);

export const insertDocumentVersionSchema = createInsertSchema(documentVersions);
export const selectDocumentVersionSchema = createSelectSchema(documentVersions);

// --- Mentoring ---
export const mentoringSessions = pgTable("mentoring_sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	mentorId: uuid("mentor_id")
		.references(() => users.id)
		.notNull(),
	userId: uuid("user_id") // Mentee
		.references(() => users.id)
		.notNull(),
	topic: text("topic").notNull(), // Used as "description" in spec
	date: text("date").notNull(), // Start time (ISO string)
	duration: integer("duration").notNull(), // in minutes
	status: text("status").default("pending"), // "pending" (locked), "confirmed", "completed", "canceled"
	price: integer("price").notNull(), // in cents
	currency: text("currency").default("USD").notNull(),
	meetingUrl: text("meeting_url"),
	// Document Integration: Documents shared by mentee for review
	sharedDocumentIds: jsonb("shared_document_ids").$type<string[]>().default([]),
	lockedAt: timestamp("locked_at"),
	expiresAt: timestamp("expires_at"),
	reminderSentAt: timestamp("reminder_sent_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMentoringSessionSchema =
	createInsertSchema(mentoringSessions);
export const selectMentoringSessionSchema =
	createSelectSchema(mentoringSessions);

export const mentorAvailabilitySlots = pgTable("mentor_availability_slots", {
	id: uuid("id").primaryKey().defaultRandom(),
	mentorId: uuid("mentor_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	isBooked: boolean("is_booked").default(false).notNull(),
	holdExpiresAt: timestamp("hold_expires_at"),
	version: integer("version").default(1).notNull(), // Optimistic locking
	createdAt: timestamp("created_at").defaultNow().notNull(),
	bookingId: uuid("booking_id").references(() => mentoringSessions.id),
});

export const insertMentorAvailabilitySlotSchema = createInsertSchema(
	mentorAvailabilitySlots,
);
export const selectMentorAvailabilitySlotSchema = createSelectSchema(
	mentorAvailabilitySlots,
);

// --- Communities (Subreddit-style) ---
export const communityCategories = pgTable("community_categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(), // "tech", "life", "career"
	name: text("name").notNull(), // "개발/테크", "일본생활"
	icon: text("icon").notNull(), // Lucide icon name or emoji
	orderIndex: integer("order_index").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityCategorySchema =
	createInsertSchema(communityCategories);
export const selectCommunityCategorySchema =
	createSelectSchema(communityCategories);
export type CommunityCategory = InferSelectModel<typeof communityCategories>;

export const communities = pgTable(
	"communities",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		slug: text("slug").notNull().unique(), // "general", "qna", "review" - NO r/ prefix
		name: text("name").notNull(), // Display name: "자유게시판"
		description: text("description"),
		bannerUrl: text("banner_url"),
		iconUrl: text("icon_url"),
		visibility: text("visibility").default("public").notNull(), // "public", "restricted", "private"
		memberCount: integer("member_count").default(0).notNull(),
		
        // New: Category FK
        categoryId: uuid("category_id").references(() => communityCategories.id),

		createdBy: uuid("created_by").references(() => users.id),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		slugIdx: uniqueIndex("communities_slug_idx").on(table.slug),
	}),
);

export const insertCommunitySchema = createInsertSchema(communities);
export const selectCommunitySchema = createSelectSchema(communities);
export type Community = InferSelectModel<typeof communities>;

export const communityMembers = pgTable(
	"community_members",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		communityId: uuid("community_id")
			.references(() => communities.id, { onDelete: "cascade" })
			.notNull(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		role: text("role").default("member").notNull(), // "member", "moderator", "owner"
		joinedAt: timestamp("joined_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueMember: uniqueIndex("community_members_unique_idx").on(
			table.communityId,
			table.userId,
		),
		userIdx: index("community_members_user_idx").on(table.userId),
	}),
);

export const insertCommunityMemberSchema = createInsertSchema(communityMembers);
export const selectCommunityMemberSchema = createSelectSchema(communityMembers);
export type CommunityMember = InferSelectModel<typeof communityMembers>;

export const communityRules = pgTable("community_rules", {
	id: uuid("id").primaryKey().defaultRandom(),
	communityId: uuid("community_id")
		.references(() => communities.id, { onDelete: "cascade" })
		.notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
	title: text("title").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityRuleSchema = createInsertSchema(communityRules);
export const selectCommunityRuleSchema = createSelectSchema(communityRules);

// --- Community Posts ---
export const communityPosts = pgTable(
	"community_posts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		// New: Link to community (nullable for migration, will be NOT NULL after)
		communityId: uuid("community_id").references(() => communities.id, {
			onDelete: "cascade",
		}),
		title: text("title").notNull(),
		content: text("content").notNull(),
		category: text("category").notNull().default("general"), // DEPRECATED: "review" | "qna" | "general"
		authorId: uuid("author_id").references(() => users.id),
		// Post type for different content formats
		postType: text("post_type").default("text").notNull(), // "text", "link", "image"
		linkUrl: text("link_url"), // For link posts
		ogTitle: text("og_title"), // OpenGraph preview
		ogDescription: text("og_description"),
		ogImage: text("og_image"),
		// Status flags
		isPinned: boolean("is_pinned").default(false).notNull(),
		isLocked: boolean("is_locked").default(false).notNull(),
		removedAt: timestamp("removed_at"),
		removedBy: uuid("removed_by").references(() => users.id),
		// Full-text search vector (managed by trigger)
		searchVector: tsvector("search_vector"),
		// Voting
		upvotes: integer("upvotes").default(0).notNull(),
		downvotes: integer("downvotes").default(0).notNull(),
		score: integer("score").default(0).notNull(),
		hotScore: numeric("hot_score").default("0"), // Pre-calculated for sorting
		commentCount: integer("comment_count").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		communityCreatedIdx: index("posts_community_created_idx").on(
			table.communityId,
			table.createdAt,
		),
		authorIdx: index("posts_author_idx").on(table.authorId),
	}),
);

export const insertCommunityPostSchema = createInsertSchema(communityPosts);
export const selectCommunityPostSchema = createSelectSchema(communityPosts);

export const communityComments = pgTable("community_comments", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id").references(() => communityPosts.id, {
		onDelete: "cascade",
	}),
	content: text("content").notNull(),
	authorId: uuid("author_id").references(() => users.id),

	parentId: uuid("parent_id"),
	depth: integer("depth").default(0).notNull(),

	isEdited: boolean("is_edited").default(false).notNull(),
	deletedAt: timestamp("deleted_at"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	upvotes: integer("upvotes").default(0).notNull(),
	downvotes: integer("downvotes").default(0).notNull(),
	score: integer("score").default(0).notNull(),
});

// Self-reference FK needs to be separate usually or handled if circular.
// For simplicty in Drizzle: references(() => communityComments.id) works inside relations or via separate Foreign Key api if needed.
// But standard pgTable definition allows referencing tables defined BEFORE. Self referencing inside same table definition:
// `parentId: uuid("parent_id").references((): AnyPgColumn => communityComments.id)` requires strict typing or lazy eval.
// Simplest is to just define column and add relation in `relations`.

export const insertCommunityCommentSchema =
	createInsertSchema(communityComments);
export const selectCommunityCommentSchema =
	createSelectSchema(communityComments);

export const commentVotes = pgTable("comment_votes", {
	id: uuid("id").primaryKey().defaultRandom(),
	commentId: uuid("comment_id")
		.references(() => communityComments.id, { onDelete: "cascade" })
		.notNull(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	voteType: integer("vote_type").notNull(), // 1 or -1
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentVoteSchema = createInsertSchema(commentVotes);
export const selectCommentVoteSchema = createSelectSchema(commentVotes);

export const postVotes = pgTable("post_votes", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id")
		.references(() => communityPosts.id, { onDelete: "cascade" })
		.notNull(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	voteType: integer("vote_type").notNull(), // 1 or -1
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostVoteSchema = createInsertSchema(postVotes);
export const selectPostVoteSchema = createSelectSchema(postVotes);

export const reputationLogs = pgTable("reputation_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	amount: integer("amount").notNull(),
	reason: text("reason").notNull(), // "post_upvote", etc.
	targetId: uuid("target_id").notNull(), // Generic ID reference
	targetType: text("target_type").notNull(), // "post" | "comment"
	createdAt: timestamp("created_at").defaultNow(),
});

export const voteAuditLogs = pgTable("vote_audit_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	targetId: uuid("target_id").notNull(),
	targetType: text("target_type").notNull(), // "post" | "comment"
	voteType: integer("vote_type").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertReputationLogSchema = createInsertSchema(reputationLogs);
export const selectReputationLogSchema = createSelectSchema(reputationLogs);

export const commentNotifications = pgTable("comment_notifications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id") // Recipient
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	actorId: uuid("actor_id") // Who triggered it
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	commentId: uuid("comment_id")
		.references(() => communityComments.id, { onDelete: "cascade" })
		.notNull(),
	type: text("type").notNull(), // "reply" | "mention"
	read: boolean("read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentNotificationSchema =
	createInsertSchema(commentNotifications);
export const selectCommentNotificationSchema =
	createSelectSchema(commentNotifications);

export const commentReports = pgTable("comment_reports", {
	id: uuid("id").primaryKey().defaultRandom(),
	commentId: uuid("comment_id")
		.references(() => communityComments.id, { onDelete: "cascade" })
		.notNull(),
	reporterId: uuid("reporter_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	reason: text("reason").notNull(), // "spam", "harassment", "inappropriate", "other"
	status: text("status").default("pending").notNull(), // "pending", "resolved", "dismissed"
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentReportSchema = createInsertSchema(commentReports);
export const selectCommentReportSchema = createSelectSchema(commentReports);

// --- Push Notifications ---
export const pushSubscriptions = pgTable("push_subscriptions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	endpoint: text("endpoint").notNull().unique(),
	p256dh: text("p256dh").notNull(),
	auth: text("auth").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertPushSubscriptionSchema =
	createInsertSchema(pushSubscriptions);
export const selectPushSubscriptionSchema =
	createSelectSchema(pushSubscriptions);

export const notificationPreferences = pgTable("notification_preferences", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade" }),
	enabledTypes: jsonb("enabled_types").$type<string[]>().default([]),
	quietHoursStart: text("quiet_hours_start"), // "HH:mm"
	quietHoursEnd: text("quiet_hours_end"), // "HH:mm"
	timezone: text("timezone").default("UTC"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferenceSchema = createInsertSchema(
	notificationPreferences,
);
export const selectNotificationPreferenceSchema = createSelectSchema(
	notificationPreferences,
);

export const notificationQueue = pgTable("notification_queue", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	payload: jsonb("payload").notNull(), // { title, body, icon, url }
	scheduledAt: timestamp("scheduled_at").defaultNow(),
	status: text("status").default("pending").notNull(), // "pending" | "failed" | "stale"
	retryCount: integer("retry_count").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationQueueSchema =
	createInsertSchema(notificationQueue);
export const selectNotificationQueueSchema =
	createSelectSchema(notificationQueue);

// --- Notification Event Log (Analytics) ---
export const notificationEventLog = pgTable(
	"notification_event_log",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		notificationId: text("notification_id"), // Composite key: type:eventId
		type: text("type").notNull(), // "community.reply", "mentoring.session_reminder", etc.
		event: text("event").notNull(), // "sent", "delivered", "clicked", "dismissed", "failed"
		errorMessage: text("error_message"),
		metadata: jsonb("metadata"), // Extra context (e.g., delivery time, failure reason)
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userTypeIdx: index("notification_event_log_user_type_idx").on(
			table.userId,
			table.type,
		),
		createdAtIdx: index("notification_event_log_created_at_idx").on(
			table.createdAt,
		),
	}),
);

export const insertNotificationEventLogSchema = createInsertSchema(
	notificationEventLog,
);
export const selectNotificationEventLogSchema = createSelectSchema(
	notificationEventLog,
);

// --- Notification Groupings (Batching) ---
export const notificationGroupings = pgTable(
	"notification_groupings",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		type: text("type").notNull(),
		groupKey: text("group_key").notNull(), // e.g., "comment:parent-id"
		notificationIds: jsonb("notification_ids")
			.$type<string[]>()
			.default([])
			.notNull(),
		count: integer("count").default(0).notNull(),
		windowStart: timestamp("window_start").defaultNow().notNull(),
		windowEnd: timestamp("window_end").notNull(),
		sentAt: timestamp("sent_at"),
		status: text("status").default("pending").notNull(), // "pending", "sent"
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		statusWindowIdx: index("notification_groupings_status_window_idx").on(
			table.status,
			table.windowEnd,
		),
	}),
);

export const insertNotificationGroupingsSchema = createInsertSchema(
	notificationGroupings,
);
export const selectNotificationGroupingsSchema = createSelectSchema(
	notificationGroupings,
);


// --- Profiles (Diagnosis) ---
export const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	jobFamily: text("job_family").notNull(), // "frontend", "backend", "mobile", etc.
	level: text("level").notNull(), // "junior", "mid", "senior"
	jpLevel: text("jp_level").notNull(), // "N1", "N2", "N3", "None"
	enLevel: text("en_level").notNull(), // "Business", "Conversational", "Basic"
	targetCity: text("target_city").default("Tokyo"),
	// v2.0 LLM Context Fields
	techStack: jsonb("tech_stack").$type<string[]>().default([]),
	hardConstraints: jsonb("hard_constraints")
		.$type<{
			degree?: "bachelor" | "associate" | "none";
			visaStatus?: "none" | "student" | "working" | "spouse" | "hsp";
		}>()
		.default({}),
	workValues: jsonb("work_values").$type<string[]>().default([]),
	careerTimeline: text("career_timeline"), // "ASAP", "3M", "1Y"
	residence: text("residence").default("KR"), // "KR", "JP", "Other"
	concerns: jsonb("concerns").$type<string[]>().default([]),
	bio: text("bio"),
	slug: text("slug").unique(),
	website: text("website"),
	linkedinUrl: text("linkedin_url"),
	githubUrl: text("github_url"),
	userId: uuid("user_id").references(() => users.id).unique(),
	// Document Integration: Featured portfolio document
	portfolioDocumentId: uuid("portfolio_document_id").references(
		() => documents.id,
		{ onDelete: "set null" },
	),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export type SelectProfile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// --- Payments ---
export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: text("order_id").notNull().unique(),
	paymentKey: text("payment_key").unique(),
	amount: text("amount").notNull(),
	currency: text("currency").default("KRW"),
	status: text("status").notNull(), // "READY", "IN_PROGRESS", "DONE", "CANCELED", "ABORTED"
	method: text("method"),
	userId: uuid("user_id").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

// --- Mentors ---
export const mentors = pgTable("mentors", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull()
		.unique(),
	title: text("title").notNull(), // e.g., "Senior Frontend Engineer"
	company: text("company"),
	bio: text("bio"),
	yearsOfExperience: text("years_of_experience"),
	hourlyRate: text("hourly_rate").notNull().default("0"),
	isApproved: text("is_approved").default("false"), // "true" | "false" (using text for simplicity or boolean)
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMentorSchema = createInsertSchema(mentors);
export const selectMentorSchema = createSelectSchema(mentors);

// --- Mentor Availability ---
export const mentorAvailability = pgTable("mentor_availability", {
	id: uuid("id").primaryKey().defaultRandom(),
	mentorId: uuid("mentor_id")
		.references(() => mentors.id, { onDelete: "cascade" })
		.notNull(),
	dayOfWeek: text("day_of_week").notNull(), // "0" (Sun) - "6" (Sat)
	startTime: text("start_time").notNull(), // "09:00"
	endTime: text("end_time").notNull(), // "18:00"
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMentorAvailabilitySchema =
	createInsertSchema(mentorAvailability);
export const selectMentorAvailabilitySchema =
	createSelectSchema(mentorAvailability);

// --- SPEC 013: Video Integrations ---
export const userIntegrations = pgTable("user_integrations", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	provider: text("provider").notNull(), // "google" | "zoom"
	accessToken: text("access_token"), // Encrypted
	refreshToken: text("refresh_token"), // Encrypted
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserIntegrationSchema = createInsertSchema(userIntegrations);
export const selectUserIntegrationSchema = createSelectSchema(userIntegrations);

// --- Profile Privacy Settings ---
export const profilePrivacySettings = pgTable("profile_privacy_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	hideEmail: boolean("hide_email").default(true).notNull(),
	hideFullName: boolean("hide_full_name").default(false).notNull(),
	hideActivity: boolean("hide_activity").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfilePrivacySettingsSchema = createInsertSchema(
	profilePrivacySettings,
);
export const selectProfilePrivacySettingsSchema = createSelectSchema(
	profilePrivacySettings,
);

// --- Relations ---

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [users.id],
		references: [profiles.userId],
	}),
	profilePrivacySettings: one(profilePrivacySettings, {
		fields: [users.id],
		references: [profilePrivacySettings.userId],
	}),
	documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id],
	}),
	versions: many(documentVersions),
}));

export const documentVersionsRelations = relations(
	documentVersions,
	({ one }) => ({
		document: one(documents, {
			fields: [documentVersions.documentId],
			references: [documents.id],
		}),
	}),
);

export const pipelineItemsRelations = relations(pipelineItems, ({ one }) => ({
	user: one(users, {
		fields: [pipelineItems.userId],
		references: [users.id],
	}),
	resume: one(documents, {
		fields: [pipelineItems.resumeId],
		references: [documents.id],
	}),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id],
	}),
	portfolioDocument: one(documents, {
		fields: [profiles.portfolioDocumentId],
		references: [documents.id],
	}),
}));

export const profilePrivacySettingsRelations = relations(
	profilePrivacySettings,
	({ one }) => ({
		user: one(users, {
			fields: [profilePrivacySettings.userId],
			references: [users.id],
		}),
	}),
);

// --- Community Relations ---
export const communitiesRelations = relations(communities, ({ one, many }) => ({
	createdByUser: one(users, {
		fields: [communities.createdBy],
		references: [users.id],
	}),
	category: one(communityCategories, {
		fields: [communities.categoryId],
		references: [communityCategories.id],
	}),
	members: many(communityMembers),
	rules: many(communityRules),
	posts: many(communityPosts),
}));

export const communityCategoriesRelations = relations(
	communityCategories,
	({ many }) => ({
		communities: many(communities),
	}),
);

export const communityMembersRelations = relations(
	communityMembers,
	({ one }) => ({
		community: one(communities, {
			fields: [communityMembers.communityId],
			references: [communities.id],
		}),
		user: one(users, {
			fields: [communityMembers.userId],
			references: [users.id],
		}),
	}),
);

export const communityRulesRelations = relations(communityRules, ({ one }) => ({
	community: one(communities, {
		fields: [communityRules.communityId],
		references: [communities.id],
	}),
}));

export const communityPostsRelations = relations(
	communityPosts,
	({ one, many }) => ({
		community: one(communities, {
			fields: [communityPosts.communityId],
			references: [communities.id],
		}),
		author: one(users, {
			fields: [communityPosts.authorId],
			references: [users.id],
		}),
		comments: many(communityComments),
	}),
);

export const communityCommentsRelations = relations(
	communityComments,
	({ one, many }) => ({
		post: one(communityPosts, {
			fields: [communityComments.postId],
			references: [communityPosts.id],
		}),
		author: one(users, {
			fields: [communityComments.authorId],
			references: [users.id],
		}),
		votes: many(commentVotes),
	}),
);

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
	comment: one(communityComments, {
		fields: [commentVotes.commentId],
		references: [communityComments.id],
	}),
	user: one(users, {
		fields: [commentVotes.userId],
		references: [users.id],
	}),
}));

export const commentNotificationsRelations = relations(
	commentNotifications,
	({ one }) => ({
		user: one(users, {
			fields: [commentNotifications.userId],
			references: [users.id],
		}),
		actor: one(users, {
			fields: [commentNotifications.actorId],
			references: [users.id],
		}),
		comment: one(communityComments, {
			fields: [commentNotifications.commentId],
			references: [communityComments.id],
		}),
	}),
);

export const commentReportsRelations = relations(commentReports, ({ one }) => ({
	comment: one(communityComments, {
		fields: [commentReports.commentId],
		references: [communityComments.id],
	}),
	reporter: one(users, {
		fields: [commentReports.reporterId],
		references: [users.id],
	}),
}));

export const pushSubscriptionsRelations = relations(
	pushSubscriptions,
	({ one }) => ({
		user: one(users, {
			fields: [pushSubscriptions.userId],
			references: [users.id],
		}),
	}),
);

export const notificationPreferencesRelations = relations(
	notificationPreferences,
	({ one }) => ({
		user: one(users, {
			fields: [notificationPreferences.userId],
			references: [users.id],
		}),
	}),
);

export const notificationQueueRelations = relations(
	notificationQueue,
	({ one }) => ({
		user: one(users, {
			fields: [notificationQueue.userId],
			references: [users.id],
		}),
	}),
);

// --- Job Posting Parser Cache ---
export const jobPostingCache = pgTable("job_posting_cache", {
	url: text("url").primaryKey(),
	urlHash: text("url_hash").notNull(),
	data: jsonb("data")
		.$type<{
			company: string;
			position: string;
			location: string;
			description: string;
			logoUrl: string | null;
		}>()
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobPostingCacheSchema = createInsertSchema(jobPostingCache);
export const selectJobPostingCacheSchema = createSelectSchema(jobPostingCache);

// --- SPEC 001: Social Auth - Account Providers ---
export const accountProviders = pgTable("account_providers", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	provider: text("provider").notNull(), // "google" | "github" | "kakao" | "line"
	providerAccountId: text("provider_account_id").notNull(),
	accessToken: text("access_token"), // Encrypted
	refreshToken: text("refresh_token"), // Encrypted
	tokenExpiresAt: timestamp("token_expires_at"),
	linkedAt: timestamp("linked_at").defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccountProviderSchema = createInsertSchema(accountProviders);
export const selectAccountProviderSchema = createSelectSchema(accountProviders);

// --- SPEC 001: Authentication Event Logging ---
export const authenticationLogs = pgTable("authentication_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	eventType: text("event_type").notNull(), // "login_success" | "login_failed" | "account_linked" | "account_unlinked" | "logout"
	provider: text("provider"), // "google" | "github" | "kakao" | "line" | "email"
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	metadata: jsonb("metadata"),
	timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAuthenticationLogSchema =
	createInsertSchema(authenticationLogs);
export const selectAuthenticationLogSchema =
	createSelectSchema(authenticationLogs);

// --- SPEC 003: Password Reset Rate Limiting ---
export const passwordResetAttempts = pgTable("password_reset_attempts", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull(),
	ipAddress: text("ip_address").notNull(),
	attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

export const insertPasswordResetAttemptSchema = createInsertSchema(
	passwordResetAttempts,
);
export const selectPasswordResetAttemptSchema = createSelectSchema(
	passwordResetAttempts,
);

// --- SPEC 003: Password Reset Event Logging ---
export const passwordResetLogs = pgTable("password_reset_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	eventType: text("event_type").notNull(), // "requested" | "completed" | "failed_invalid_token" | "failed_expired_token"
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertPasswordResetLogSchema =
	createInsertSchema(passwordResetLogs);
export const selectPasswordResetLogSchema =
	createSelectSchema(passwordResetLogs);

// --- SPEC 004: Avatar Upload Rate Limiting ---
export const avatarUploadAttempts = pgTable("avatar_upload_attempts", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertAvatarUploadAttemptSchema =
	createInsertSchema(avatarUploadAttempts);
export const selectAvatarUploadAttemptSchema =
	createSelectSchema(avatarUploadAttempts);

// --- SPEC 004: Avatar Audit Logging ---
export const avatarLogs = pgTable("avatar_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	action: text("action").notNull(), // "uploaded" | "deleted"
	previousUrl: text("previous_url"),
	newUrl: text("new_url"),
	fileSize: integer("file_size"),
	timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAvatarLogSchema = createInsertSchema(avatarLogs);
export const selectAvatarLogSchema = createSelectSchema(avatarLogs);

// --- SPEC 005: Badge System ---
export const badges = pgTable("badges", {
	id: text("id").primaryKey(), // "mentor", "top-contributor", etc.
	name: text("name").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	color: text("color").notNull(),
	criteria: jsonb("criteria").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges);
export const selectBadgeSchema = createSelectSchema(badges);

export const userBadges = pgTable("user_badges", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	badgeId: text("badge_id")
		.references(() => badges.id, { onDelete: "cascade" })
		.notNull(),
	awardedAt: timestamp("awarded_at").defaultNow().notNull(),
	displayOrder: integer("display_order").default(0),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges);
export const selectUserBadgeSchema = createSelectSchema(userBadges);

// --- SPEC 005: URL Slug History ---
export const userSlugHistory = pgTable("user_slug_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	slug: text("slug").notNull().unique(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSlugHistorySchema = createInsertSchema(userSlugHistory);
export const selectUserSlugHistorySchema = createSelectSchema(userSlugHistory);

// --- SPEC 005: Mentor Profiles (Extended) ---
export const mentorProfiles = pgTable("mentor_profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	company: text("company"),
	jobTitle: text("job_title"),
	yearsOfExperience: integer("years_of_experience"),
	hourlyRate: integer("hourly_rate"), // in cents
	currency: text("currency").default("USD").notNull(),
	bio: text("bio"),
	specialties: jsonb("specialties").$type<string[]>(),
	availability: jsonb("availability"),
	languages: jsonb("languages").$type<string[]>(),
	timezone: text("timezone"),
	isActive: boolean("is_active").default(true).notNull(),
	averageRating: integer("average_rating").default(0), // Store as integer (rating * 100)
	totalReviews: integer("total_reviews").default(0),
	isTopRated: boolean("is_top_rated").default(false).notNull(), // FR-007: 4.8+ avg and 10+ reviews
	totalSessions: integer("total_sessions").default(0).notNull(),
	preferredVideoProvider: text("preferred_video_provider").default("jitsi"), // "jitsi" | "google" | "zoom" | "manual"
	manualMeetingUrl: text("manual_meeting_url"),
	socialHandles: jsonb("social_handles").$type<{
		linkedin?: string;
		x?: string;
		instagram?: string;
		threads?: string;
		youtube?: string;
	}>(),
	videoUrls: jsonb("video_urls").$type<string[]>(), // Array of YouTube URLs
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMentorProfileSchema = createInsertSchema(mentorProfiles);
export const selectMentorProfileSchema = createSelectSchema(mentorProfiles);

// --- SPEC 006: S3 Upload Tokens ---
export const uploadTokens = pgTable("upload_tokens", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const insertUploadTokenSchema = createInsertSchema(uploadTokens);
export const selectUploadTokenSchema = createSelectSchema(uploadTokens);

// --- SPEC 006: File Operation Logging ---
export const fileOperationLogs = pgTable(
	"file_operation_logs",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		documentId: uuid("document_id")
			.references(() => documents.id, { onDelete: "set null" })
			.notNull(),
		operation: text("operation").notNull(), // "upload" | "download" | "rename" | "delete"
		fileSize: text("file_size"), // Store as text to avoid BigInt issues
		oldValue: text("old_value"), // For rename: old filename/title
		newValue: text("new_value"), // For rename: new filename/title
		ipAddress: text("ip_address").notNull(),
		status: text("status"), // "success" | "failed"
		error: text("error"), // Error message if status = failed
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		// CHECK constraint for operation enum
		operationCheck: check(
			"file_operation_logs_operation_check",
			sql`${table.operation} IN ('upload', 'download', 'rename', 'delete')`,
		),
		// CHECK constraint for status enum
		statusCheck: check(
			"file_operation_logs_status_check",
			sql`${table.status} IN ('success', 'failed')`,
		),
		// Index for querying by document
		documentCreatedAtIdx: index(
			"file_operation_logs_document_created_at_idx",
		).on(table.documentId, table.createdAt),
		// Index for querying by user
		userCreatedAtIdx: index("file_operation_logs_user_created_at_idx").on(
			table.userId,
			table.createdAt,
		),
	}),
);

export const insertFileOperationLogSchema =
	createInsertSchema(fileOperationLogs);
export const selectFileOperationLogSchema =
	createSelectSchema(fileOperationLogs);

// --- Additional Relations ---

export const accountProvidersRelations = relations(
	accountProviders,
	({ one }) => ({
		user: one(users, {
			fields: [accountProviders.userId],
			references: [users.id],
		}),
	}),
);

export const badgesRelations = relations(badges, ({ many }) => ({
	userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.id],
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.id],
	}),
}));

export const mentorProfilesRelations = relations(mentorProfiles, ({ one }) => ({
	user: one(users, {
		fields: [mentorProfiles.userId],
		references: [users.id],
	}),
}));

export const mentoringSessionsRelations = relations(
	mentoringSessions,
	({ one }) => ({
		mentor: one(users, {
			fields: [mentoringSessions.mentorId],
			references: [users.id],
			relationName: "mentoringSessions_mentor",
		}),
		mentee: one(users, {
			fields: [mentoringSessions.userId],
			references: [users.id],
			relationName: "mentoringSessions_mentee",
		}),
	}),
);

// NOTE: mentorReviewsRelations is defined after mentorReviews table (line ~1020)

export const mentorApplications = pgTable("mentor_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id)
		.notNull(),

	// Professional Info
	jobTitle: text("job_title").notNull(),
	company: text("company").notNull(),
	yearsOfExperience: integer("years_of_experience").notNull(),
	linkedinUrl: text("linkedin_url"),
	bio: text("bio").notNull(),

	// JSON Fields
	expertise: jsonb("expertise").$type<string[]>().notNull(), // e.g. ["Frontend", "React"]
	languages: jsonb("languages").$type<Record<string, string>>().notNull(), // e.g. { japanese: "N1", english: "Business" }

	// Pricing
	hourlyRate: integer("hourly_rate").notNull().default(5000), // in JPY

	// Verification
	verificationFileUrl: text("verification_file_url").notNull(), // S3 Key (Private)

	// Status
	status: text("status").default("pending").notNull(), // "pending", "approved", "rejected", "under_review"
	rejectionReason: text("rejection_reason"),
	rejectedAt: timestamp("rejected_at"),
	requestedInfoReason: text("requested_info_reason"),
	reviewedBy: uuid("reviewed_by").references(() => users.id),
	reviewedAt: timestamp("reviewed_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMentorApplicationSchema =
	createInsertSchema(mentorApplications);
export const selectMentorApplicationSchema =
	createSelectSchema(mentorApplications);

export type InsertMentorApplication = typeof mentorApplications.$inferInsert;
export type SelectMentorApplication = typeof mentorApplications.$inferSelect;

export const mentorApplicationsRelations = relations(
	mentorApplications,
	({ one }) => ({
		user: one(users, {
			fields: [mentorApplications.userId],
			references: [users.id],
		}),
		reviewer: one(users, {
			fields: [mentorApplications.reviewedBy],
			references: [users.id],
		}),
	}),
);

export const adminAuditLogs = pgTable("admin_audit_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	adminId: uuid("admin_id")
		.references(() => users.id)
		.notNull(),
	action: text("action").notNull(), // "mentor_approve", "mentor_reject"
	targetId: uuid("target_id").notNull(), // Application ID or other entity
	metadata: jsonb("metadata"), // Extra info
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs);
export const selectAdminAuditLogSchema = createSelectSchema(adminAuditLogs);

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
	admin: one(users, {
		fields: [adminAuditLogs.adminId],
		references: [users.id],
	}),
}));

// --- SPEC 014: Review System ---
export const mentorReviews = pgTable("mentor_reviews", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id")
		.references(() => mentoringSessions.id, { onDelete: "cascade" })
		.notNull(),
	menteeId: uuid("mentee_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	mentorId: uuid("mentor_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),

	rating: integer("rating").notNull(), // 1-5
	text: text("text"), // Optional review text
	isAnonymous: boolean("is_anonymous").default(false).notNull(),

	// FR-008: Mentor response
	mentorResponse: text("mentor_response"),
	mentorRespondedAt: timestamp("mentor_responded_at"),

	// FR-009-010: Moderation
	isHidden: boolean("is_hidden").default(false).notNull(),
	moderationReason: text("moderation_reason"),
	moderatedAt: timestamp("moderated_at"),

	status: text("status").default("published").notNull(), // published, flagged, hidden, deleted

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMentorReviewSchema = createInsertSchema(mentorReviews);
export const selectMentorReviewSchema = createSelectSchema(mentorReviews);

export const mentorReviewsRelations = relations(mentorReviews, ({ one }) => ({
	mentor: one(users, {
		fields: [mentorReviews.mentorId],
		references: [users.id],
	}),
	mentee: one(users, {
		fields: [mentorReviews.menteeId],
		references: [users.id],
	}),
	session: one(mentoringSessions, {
		fields: [mentorReviews.sessionId],
		references: [mentoringSessions.id],
	}),
}));

export const mentorReviewResponses = pgTable("mentor_review_responses", {
	id: uuid("id").primaryKey().defaultRandom(),
	reviewId: uuid("review_id")
		.references(() => mentorReviews.id, { onDelete: "cascade" })
		.notNull(),
	mentorId: uuid("mentor_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),

	text: text("text").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMentorReviewResponseSchema = createInsertSchema(
	mentorReviewResponses,
);
export const selectMentorReviewResponseSchema = createSelectSchema(
	mentorReviewResponses,
);

export const mentorBadges = pgTable("mentor_badges", {
	mentorId: uuid("mentor_id")
		.primaryKey()
		.references(() => mentors.id, { onDelete: "cascade" }),
	badgeType: text("badge_type").notNull(), // "top_rated"

	weightedAverageRating: numeric("weighted_average_rating", {
		precision: 3,
		scale: 2,
	}),
	totalReviews: integer("total_reviews").default(0).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMentorBadgeSchema = createInsertSchema(mentorBadges);
export const selectMentorBadgeSchema = createSelectSchema(mentorBadges);

export const reviewModerationLogs = pgTable("review_moderation_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	reviewId: uuid("review_id")
		.references(() => mentorReviews.id, { onDelete: "cascade" })
		.notNull(),
	adminId: uuid("admin_id")
		.references(() => users.id)
		.notNull(),

	action: text("action").notNull(), // flag, hide, unhide, delete
	reason: text("reason"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewModerationLogSchema =
	createInsertSchema(reviewModerationLogs);
export const selectReviewModerationLogSchema =
	createSelectSchema(reviewModerationLogs);

export const reviewDisputes = pgTable("review_disputes", {
	id: uuid("id").primaryKey().defaultRandom(),
	reviewId: uuid("review_id")
		.references(() => mentorReviews.id, { onDelete: "cascade" })
		.notNull(),
	mentorId: uuid("mentor_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),

	reason: text("reason").notNull(),
	status: text("status").default("pending").notNull(), // pending, resolved, dismissed

	createdAt: timestamp("created_at").defaultNow().notNull(),
	resolvedAt: timestamp("resolved_at"),
	resolvedBy: uuid("resolved_by").references(() => users.id),
});

export const insertReviewDisputeSchema = createInsertSchema(reviewDisputes);
export const selectReviewDisputeSchema = createSelectSchema(reviewDisputes);

// --- SPEC 010: Search Analytics ---
export const searchAnalytics = pgTable("search_analytics", {
	id: uuid("id").primaryKey().defaultRandom(),
	query: text("query").notNull(),
	resultCount: integer("result_count").notNull().default(0),
	category: text("category"), // Filter category if applied
	resultIds: jsonb("result_ids").$type<string[]>().default([]), // Top result IDs
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSearchAnalyticsSchema = createInsertSchema(searchAnalytics);
export const selectSearchAnalyticsSchema = createSelectSchema(searchAnalytics);

// --- SPEC 016: Roadmap Templates ---
export const roadmapTemplates = pgTable("roadmap_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(), // "Learning" | "Application" | "Preparation" | "Settlement"
	estimatedMinutes: integer("estimated_minutes").notNull().default(60),
	priority: text("priority").notNull().default("normal"), // "urgent" | "normal" | "low"
	orderIndex: integer("order_index").notNull().default(0),

	// Targeting Conditions (NULL = applies to all)
	targetJobFamilies: jsonb("target_job_families").$type<string[] | null>(),
	targetLevels: jsonb("target_levels").$type<string[] | null>(),
	targetJpLevels: jsonb("target_jp_levels").$type<string[] | null>(),
	targetCities: jsonb("target_cities").$type<string[] | null>(),

	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoadmapTemplateSchema = createInsertSchema(roadmapTemplates);
export const selectRoadmapTemplateSchema = createSelectSchema(roadmapTemplates);
export type RoadmapTemplate = InferSelectModel<typeof roadmapTemplates>;
export type InsertRoadmapTemplate = typeof roadmapTemplates.$inferInsert;

// --- SPEC 016: User Roadmaps ---
export const userRoadmaps = pgTable("user_roadmaps", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	generatedAt: timestamp("generated_at").defaultNow().notNull(),
	totalTasks: integer("total_tasks").notNull().default(0),
	completedTasks: integer("completed_tasks").notNull().default(0),
	currentMilestone: text("current_milestone").default("started"), // "started" | "first_task" | "learning_done" | "fifty_percent" | "all_done"
	lastMilestoneAt: timestamp("last_milestone_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserRoadmapSchema = createInsertSchema(userRoadmaps);
export const selectUserRoadmapSchema = createSelectSchema(userRoadmaps);
export type UserRoadmap = InferSelectModel<typeof userRoadmaps>;

// --- SPEC 016: Roadmap Tasks (extends tasks with roadmap-specific fields) ---
export const roadmapTasks = pgTable("roadmap_tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	templateId: uuid("template_id").references(() => roadmapTemplates.id),

	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(), // "Learning" | "Application" | "Preparation" | "Settlement"
	estimatedMinutes: integer("estimated_minutes").notNull().default(60),
	priority: text("priority").notNull().default("normal"),
	orderIndex: integer("order_index").notNull().default(0),

	kanbanColumn: text("kanban_column").notNull().default("todo"), // "todo" | "in_progress" | "completed"
	isCustom: boolean("is_custom").notNull().default(false),
	completedAt: timestamp("completed_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoadmapTaskSchema = createInsertSchema(roadmapTasks);
export const selectRoadmapTaskSchema = createSelectSchema(roadmapTasks);
export type RoadmapTask = InferSelectModel<typeof roadmapTasks>;
export type InsertRoadmapTask = typeof roadmapTasks.$inferInsert;

// --- SPEC 016: Roadmap Relations ---
export const roadmapTemplatesRelations = relations(
	roadmapTemplates,
	({ many }) => ({
		tasks: many(roadmapTasks),
	}),
);

export const userRoadmapsRelations = relations(userRoadmaps, ({ one }) => ({
	user: one(users, {
		fields: [userRoadmaps.userId],
		references: [users.id],
	}),
}));

export const roadmapTasksRelations = relations(roadmapTasks, ({ one }) => ({
	user: one(users, {
		fields: [roadmapTasks.userId],
		references: [users.id],
	}),
	template: one(roadmapTemplates, {
		fields: [roadmapTasks.templateId],
		references: [roadmapTemplates.id],
	}),
}));

// ============================================================
// SPEC 019: Settlement Checklist
// ============================================================

// --- User Settlements (User's arrival date and progress) ---
export const userSettlements = pgTable("user_settlements", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull()
		.unique(),
	arrivalDate: timestamp("arrival_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSettlementSchema = createInsertSchema(userSettlements);
export const selectUserSettlementSchema = createSelectSchema(userSettlements);
export type UserSettlement = InferSelectModel<typeof userSettlements>;

// --- Settlement Categories ---
export const settlementCategories = pgTable("settlement_categories", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(), // e.g., 'government', 'housing'
	titleKo: text("title_ko").notNull(),
	titleJa: text("title_ja"),
	icon: text("icon").notNull(), // Emoji or icon name
	orderIndex: integer("order_index").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettlementCategorySchema =
	createInsertSchema(settlementCategories);
export const selectSettlementCategorySchema =
	createSelectSchema(settlementCategories);

export type SettlementCategory = InferSelectModel<typeof settlementCategories>;

// --- Settlement Relations ---
export const userSettlementsRelations = relations(
	userSettlements,
	({ one }) => ({
		user: one(users, {
			fields: [userSettlements.userId],
			references: [users.id],
		}),
	}),
);

// --- Settlement Marketplace (v2) ---
export const settlementTemplates = pgTable("settlement_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	authorId: uuid("author_id").references(() => users.id),
	title: text("title").notNull(),
	description: text("description"),
	tags: jsonb("tags").$type<string[]>().default([]),
	isOfficial: boolean("is_official").default(false).notNull(),
	status: text("status").default("draft").notNull(), // "draft" | "published" | "archived"
	version: integer("version").default(1).notNull(),

	// Advanced Filtering
	targetVisa: text("target_visa"), // e.g., "Engineer", "Student"
	familyStatus: text("family_status"), // e.g., "Single", "Family"
	region: text("region").default("Tokyo"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettlementTemplateSchema =
	createInsertSchema(settlementTemplates);
export const selectSettlementTemplateSchema =
	createSelectSchema(settlementTemplates);

export type SettlementTemplate = InferSelectModel<typeof settlementTemplates>;

export const settlementTaskTemplates = pgTable("settlement_task_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	templateId: uuid("template_id")
		.references(() => settlementTemplates.id, { onDelete: "cascade" })
		.notNull(),
	slug: text("slug"), // For identifying similar tasks across templates

	// Bilingual Content
	titleKo: text("title_ko"),
	titleJa: text("title_ja"),
	instructionsKo: text("instructions_ko"),
	instructionsJa: text("instructions_ja"),

	// Fallback/Generic Content (for user generated)
	title: text("title"),
	description: text("description"),

	category: text("category").notNull(),
	phaseId: uuid("phase_id").references(() => settlementPhases.id), // Explicit phase linkage
	dayOffset: integer("day_offset"), // Nullable: Floating within Phase. Positive/Negative relative to anchor.
	isRequired: boolean("is_required").default(false).notNull(),

	orderIndex: integer("order_index").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettlementTaskTemplateSchema = createInsertSchema(
	settlementTaskTemplates,
);
export const selectSettlementTaskTemplateSchema = createSelectSchema(
	settlementTaskTemplates,
);

export type SettlementTaskTemplate = InferSelectModel<
	typeof settlementTaskTemplates
>;

export const settlementSubscriptions = pgTable(
	"settlement_subscriptions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		templateId: uuid("template_id")
			.references(() => settlementTemplates.id, { onDelete: "cascade" })
			.notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		equippedAt: timestamp("equipped_at").defaultNow().notNull(),
	},
	(table) => ({
		unq: uniqueIndex("settlement_subs_user_template_idx").on(
			table.userId,
			table.templateId,
		),
	}),
);

export const insertSettlementSubscriptionSchema = createInsertSchema(
	settlementSubscriptions,
);
export const selectSettlementSubscriptionSchema = createSelectSchema(
	settlementSubscriptions,
);

export const settlementReviews = pgTable(
	"settlement_reviews",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		templateId: uuid("template_id")
			.references(() => settlementTemplates.id, { onDelete: "cascade" })
			.notNull(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		rating: integer("rating").notNull(), // 1-5
		comment: text("comment"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		unq: uniqueIndex("settlement_reviews_user_template_idx").on(
			table.userId,
			table.templateId,
		),
	}),
);

export const settlementReviewsRelations = relations(
	settlementReviews,
	({ one }) => ({
		template: one(settlementTemplates, {
			fields: [settlementReviews.templateId],
			references: [settlementTemplates.id],
		}),
		author: one(users, {
			fields: [settlementReviews.userId],
			references: [users.id],
		}),
	}),
);

export const userTaskCompletions = pgTable("user_task_completions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	taskId: uuid("task_id")
		.references(() => settlementTaskTemplates.id, { onDelete: "cascade" })
		.notNull(),
	completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertUserTaskCompletionSchema =
	createInsertSchema(userTaskCompletions);
export const selectUserTaskCompletionSchema =
	createSelectSchema(userTaskCompletions);
export type UserTaskCompletion = InferSelectModel<typeof userTaskCompletions>;

export const settlementTemplatesRelations = relations(
	settlementTemplates,
	({ one, many }) => ({
		author: one(users, {
			fields: [settlementTemplates.authorId],
			references: [users.id],
		}),
		tasks: many(settlementTaskTemplates),
		subscriptions: many(settlementSubscriptions),
	}),
);

export const settlementTaskTemplatesRelations = relations(
	settlementTaskTemplates,
	({ one }) => ({
		template: one(settlementTemplates, {
			fields: [settlementTaskTemplates.templateId],
			references: [settlementTemplates.id],
		}),
		phase: one(settlementPhases, {
			fields: [settlementTaskTemplates.phaseId],
			references: [settlementPhases.id],
		}),
	}),
);

export const settlementPhases = pgTable("settlement_phases", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(), // Internal key or default title
	titleKo: text("title_ko"), // Korean Display Title
	titleJa: text("title_ja"), // Japanese Display Title
	titleEn: text("title_en"), // English Display Title
	description: text("description"),
	minDays: integer("min_days").notNull(), // Inclusive start
	maxDays: integer("max_days").notNull(), // Inclusive end
	orderIndex: integer("order_index").notNull().default(0),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettlementPhaseSchema = createInsertSchema(settlementPhases);
export const selectSettlementPhaseSchema = createSelectSchema(settlementPhases);

export type SettlementPhase = InferSelectModel<typeof settlementPhases>;

export const settlementSubscriptionsRelations = relations(
	settlementSubscriptions,
	({ one }) => ({
		user: one(users, {
			fields: [settlementSubscriptions.userId],
			references: [users.id],
		}),
		template: one(settlementTemplates, {
			fields: [settlementSubscriptions.templateId],
			references: [settlementTemplates.id],
		}),
	}),
);

export const userTaskCompletionsRelations = relations(
	userTaskCompletions,
	({ one }) => ({
		user: one(users, {
			fields: [userTaskCompletions.userId],
			references: [users.id],
		}),
		task: one(settlementTaskTemplates, {
			fields: [userTaskCompletions.taskId],
			references: [settlementTaskTemplates.id],
		}),
	}),
);

// --- Map Locations (SPEC 020) ---
export const mapLocations = pgTable("map_locations", {
	id: uuid("id").primaryKey().defaultRandom(),
	category: text("category").notNull(), // "government" | "immigration" | "banking" | "mobile" | "housing" | "shopping"
	nameEn: text("name_en").notNull(),
	nameJa: text("name_ja").notNull(),
	nameKo: text("name_ko").notNull(),
	address: text("address").notNull(),
	latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
	longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
	phone: text("phone"),
	hours: text("hours"), // "09:00-18:00"
	station: text("station"), // 최근역 이름
	area: text("area").default("tokyo"), // "tokyo" | "yokohama" | "chiba" | "saitama"
	isVerified: boolean("is_verified").default(false),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMapLocationSchema = createInsertSchema(mapLocations);
export const selectMapLocationSchema = createSelectSchema(mapLocations);
export type MapLocation = InferSelectModel<typeof mapLocations>;
export type InsertMapLocation = typeof mapLocations.$inferInsert;

// --- User Favorites (SPEC 020) ---
export const userFavorites = pgTable("user_favorites", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	locationId: uuid("location_id")
		.references(() => mapLocations.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites);
export const selectUserFavoriteSchema = createSelectSchema(userFavorites);
export type UserFavorite = InferSelectModel<typeof userFavorites>;

// --- Custom Markers (SPEC 020) ---
export const customMarkers = pgTable("custom_markers", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	category: text("category").notNull(),
	latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
	longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomMarkerSchema = createInsertSchema(customMarkers);
export const selectCustomMarkerSchema = createSelectSchema(customMarkers);
export type CustomMarker = InferSelectModel<typeof customMarkers>;

// --- Map Relations ---
export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
	user: one(users, {
		fields: [userFavorites.userId],
		references: [users.id],
	}),
	location: one(mapLocations, {
		fields: [userFavorites.locationId],
		references: [mapLocations.id],
	}),
}));

export const customMarkersRelations = relations(customMarkers, ({ one }) => ({
	user: one(users, {
		fields: [customMarkers.userId],
		references: [users.id],
	}),
}));

// --- House Ads (Advertisement System) ---
export const houseAds = pgTable(
	"house_ads",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		imageUrl: text("image_url"),
		ctaText: text("cta_text").notNull(), // Call-to-action text
		ctaUrl: text("cta_url").notNull(), // Target URL
		
		// Placement & Targeting
		placement: text("placement").notNull(), // 'sidebar', 'feed-top', 'feed-middle', 'inline'
		targetCategories: jsonb("target_categories").$type<string[]>(), // ['frontend', 'backend']
		targetPages: jsonb("target_pages").$type<string[]>(), // ['dashboard', 'pipeline']
		
		// Ad Management
		weight: integer("weight").default(1).notNull(), // For weighted random selection
		status: text("status").default("active").notNull(), // 'active', 'paused', 'archived'
		startDate: timestamp("start_date").notNull(),
		endDate: timestamp("end_date").notNull(),
		
		// Analytics
		impressions: integer("impressions").default(0).notNull(),
		clicks: integer("clicks").default(0).notNull(),
		
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		placementIdx: index("house_ads_placement_idx").on(table.placement),
		statusIdx: index("house_ads_status_idx").on(table.status),
		dateRangeIdx: index("house_ads_date_range_idx").on(
			table.startDate,
			table.endDate,
		),
	}),
);

export const insertHouseAdSchema = createInsertSchema(houseAds);
export const selectHouseAdSchema = createSelectSchema(houseAds);
export type HouseAd = InferSelectModel<typeof houseAds>;

// --- Widget Configurations (Dashboard Customization) - SPEC-026 ---
export const widgetConfigurations = pgTable(
	"widget_configurations",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull()
			.unique(), // One configuration per user

		// Widget layout stored as JSONB array for flexibility
		widgets: jsonb("widgets").notNull().$type<WidgetLayout[]>(),

		// Metadata
		lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
		version: integer("version").default(1).notNull(), // For schema migrations

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdx: uniqueIndex("widget_configurations_user_idx").on(table.userId),
	}),
);

export const insertWidgetConfigurationSchema =
	createInsertSchema(widgetConfigurations);
export const selectWidgetConfigurationSchema =
	createSelectSchema(widgetConfigurations);
export type WidgetConfiguration = InferSelectModel<
	typeof widgetConfigurations
>;

// TypeScript types for widget system
export interface WidgetLayout {
	id: WidgetId;
	order: number; // 0-based index for sorting
	visible: boolean;
	size: "compact" | "standard" | "expanded";
	column?: 1 | 2; // For desktop 2-column layout (undefined for mobile)
}

export type WidgetId =
	| "journey-progress"
	| "priority-actions"
	| "roadmap-snapshot"
	| "pipeline-overview"
	| "mentor-sessions"
	| "settlement-checklist"
	| "community-highlights"
	| "document-hub"
	| "notifications-center"
	| "mentor-application";

export type JourneyStage =
	| "newcomer"
	| "learner"
	| "applicant"
	| "settlement"
	| "contributor";

// Widget metadata for UI rendering
export interface WidgetMetadata {
	id: WidgetId;
	name: string;
	description: string;
	icon: string; // Lucide React icon name
	defaultSize: WidgetLayout["size"];
	minSize: WidgetLayout["size"];
	maxSize: WidgetLayout["size"];
	// Optional visibility condition
	visibilityCondition?: (context: {
		hasProfile: boolean;
		hasApplications: boolean;
		hasSessions: boolean;
		hasArrivalDate: boolean;
		hasMentorApplication: boolean;
	}) => boolean;
}

