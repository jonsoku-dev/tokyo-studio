import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	// --- Pages ---
	// Dashboard
	index("features/dashboard/routes/home.tsx"),

	// Auth
	route("login", "features/auth/routes/login.tsx"),
	route("signup", "features/auth/routes/signup.tsx"),
	route("verify-email", "features/auth/routes/verify-email.tsx"),
	route(
		"verify-email/required",
		"features/auth/routes/verify-email.required.tsx",
	),
	route("resend-verification", "features/auth/routes/resend-verification.tsx"),
	route("forgot-password", "features/auth/routes/forgot-password.tsx"),
	route("reset-password", "features/auth/routes/reset-password.tsx"),

	// Features
	route("pipeline", "features/pipeline/routes/pipeline.tsx"),
	route("documents", "features/documents/routes/documents.tsx"),
	route("documents/new", "features/documents/routes/new.tsx"),
	route("mentoring", "features/mentoring/routes/mentoring.index.tsx"),
	route(
		"mentoring/bookings",
		"features/mentoring/routes/mentoring.bookings.tsx",
	),
	route(
		"mentoring/apply",
		"features/mentoring/routes/mentoring.apply.tsx",
	),

	route(
		"mentoring/session/:sessionId/review",
		"features/mentoring/routes/mentoring.session.$sessionId.review.tsx",
	),
	route(
		"mentoring/settings",
		"features/mentoring/routes/mentoring.settings.tsx",
	),
	route("community", "features/community/routes/community.tsx"),
	route("community/search", "features/community/routes/community.search.tsx"),
	route("community/new", "features/community/routes/new.tsx"),
	route("community/:postId", "features/community/routes/post-detail.tsx"),
	route("settings/profile", "features/users/routes/profile.tsx"),
	route("settings/privacy", "features/users/routes/settings/privacy.tsx"),
	route("settings/notifications", "features/notifications/routes/settings.tsx"),
	route("profile/:username", "features/users/routes/profile.$username.tsx"),

	route("diagnosis", "features/diagnosis/routes/diagnosis.tsx"),
	route("diagnosis/result", "features/diagnosis/routes/result.tsx"),

	// Roadmap (SPEC 016)
	route("roadmap", "features/roadmap/routes/index.tsx"),

	route("payment/checkout", "features/payment/routes/checkout.tsx"),
	route("payment/success", "features/payment/routes/success.tsx"),

	// --- APIs ---
	// Auth APIs
	route("api/auth/google", "features/auth/apis/google.ts"),
	route("api/auth/google/callback", "features/auth/apis/google.callback.ts"),
	route("api/auth/github", "features/auth/apis/github.ts"),
	route("api/auth/github/callback", "features/auth/apis/github.callback.ts"),
	route("api/auth/kakao", "features/auth/apis/kakao.ts"),
	route("api/auth/kakao/callback", "features/auth/apis/kakao.callback.ts"),
	route("api/auth/line", "features/auth/apis/line.ts"),
	route("api/auth/line/callback", "features/auth/apis/line.callback.ts"),
	route(
		"api/auth/forgot-password",
		"features/auth/apis/api.auth.forgot-password.ts",
	),
	route(
		"api/auth/resend-verification",
		"features/auth/apis/api.auth.resend-verification.ts",
	),
	route("api/auth/reset-password", "features/auth/apis/reset-password.ts"),
	route("api/users/me/avatar", "features/users/apis/avatar.ts"),
	route("api/users/me/profile", "features/users/apis/profile.ts"),
	route("api/users/me/privacy", "features/users/apis/privacy.ts"),

	// Storage APIs
	route("api/storage/presigned", "features/storage/apis/presigned.ts"),
	route("api/storage/upload", "features/storage/apis/upload.ts"),
	route("api/storage/confirm", "features/storage/apis/confirm.ts"),
	route(
		"api/storage/download/:documentId",
		"features/storage/apis/download.$documentId.ts",
	),
	route("api/storage/files", "features/storage/apis/files.ts"),
	route(
		"api/documents/:documentId",
		"features/documents/apis/document-detail.ts",
	),

	// Community APIs
	route("api/comments", "features/community/apis/comments.ts"),
	route("api/comments/:commentId", "features/community/apis/comment-detail.ts"),
	route("api/comments/:commentId/report", "features/community/apis/report.ts"),
	route("api/notifications", "features/community/apis/notifications.ts"),
	route("api/search", "features/community/apis/api.search.ts"),
	route(
		"api/search/suggestions",
		"features/community/apis/api.search.suggestions.ts",
	),
	route("api/setup-search", "features/community/apis/api.setup-search.ts"),
	route("api/setup-voting", "features/community/apis/api.setup-voting.ts"),
	route(
		"api/setup-reputation",
		"features/community/apis/api.setup-reputation.ts",
	),
	route("api/vote", "features/community/apis/api.vote.ts"),
	route(
		"api/notifications/subscribe",
		"features/notifications/apis/subscribe.ts",
	),

	// Mentoring APIs (SPEC 013-015)
	route("mentoring/session/:sessionId/join", "features/mentoring/apis/api.mentoring.session.join.ts"),
	route(
		"api/mentoring/session/:sessionId/review",
		"features/mentoring/apis/api.mentoring.review.submit.ts",
	),
	route(
		"api/mentoring/mentor/:mentorId/reviews",
		"features/mentoring/apis/api.mentoring.reviews.get.ts",
	),
	route(
		"api/mentoring/review/:reviewId/response",
		"features/mentoring/apis/api.mentoring.review.response.ts",
	),

	// route(\"api/notifications/settings\", \"features/notifications/apis/settings.ts\"), // TODO: Implement settings API

	// Roadmap APIs (SPEC 016)
	route("api/roadmap/tasks/:id", "features/roadmap/apis/task.$id.ts"),
] satisfies RouteConfig;
