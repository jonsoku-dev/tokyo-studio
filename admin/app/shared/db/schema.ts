import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// --- Users ---
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role").default("user"), // "user" | "admin"
    status: text("status").default("active"), // "active" | "suspended"
    avatarUrl: text("avatar_url"),
    googleId: text("google_id").unique(),
    githubId: text("github_id").unique(),
    kakaoId: text("kakao_id").unique(),
    lineId: text("line_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

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

// --- Pipeline Items ---
export const pipelineItems = pgTable("pipeline_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    company: text("company").notNull(),
    position: text("position").notNull(),
    stage: text("stage").notNull(), // "applied" | "interview" | "offer" | "rejected"
    date: text("date").notNull(),
    nextAction: text("next_action"),
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Documents ---
export const documents = pgTable("documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    type: text("type").notNull(), // "Resume" | "CV" | "Portfolio"
    status: text("status").default("draft"), // "draft" | "final"
    url: text("url"),
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Mentoring ---
export const mentoringSessions = pgTable("mentoring_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorName: text("mentor_name").notNull(),
    topic: text("topic").notNull(),
    date: text("date").notNull(),
    status: text("status").default("scheduled"), // "scheduled" | "completed" | "canceled"
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Community ---
export const communityPosts = pgTable("community_posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("general"), // "review" | "qna" | "general"
    authorId: uuid("author_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityComments = pgTable("community_comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").references(() => communityPosts.id, {
        onDelete: "cascade",
    }),
    content: text("content").notNull(),
    authorId: uuid("author_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Profiles (Diagnosis) ---
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobFamily: text("job_family").notNull(), // "frontend", "backend", "mobile", etc.
    level: text("level").notNull(), // "junior", "mid", "senior"
    jpLevel: text("jp_level").notNull(), // "N1", "N2", "N3", "None"
    enLevel: text("en_level").notNull(), // "Business", "Conversational", "Basic"
    targetCity: text("target_city").default("Tokyo"),
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

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

// --- Mentors ---
export const mentors = pgTable("mentors", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),
    title: text("title").notNull(), // e.g., "Senior Frontend Engineer"
    company: text("company"),
    bio: text("bio"),
    yearsOfExperience: text("years_of_experience"),
    hourlyRate: text("hourly_rate").notNull().default("0"),
    isApproved: text("is_approved").default("false"), // "true" | "false"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Mentor Availability ---
export const mentorAvailability = pgTable("mentor_availability", {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id").references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
    dayOfWeek: text("day_of_week").notNull(), // "0" (Sun) - "6" (Sat)
    startTime: text("start_time").notNull(), // "09:00"
    endTime: text("end_time").notNull(), // "18:00"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
