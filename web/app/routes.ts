import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	// --- PUBLIC LAYOUT (No authentication required) ---
	layout("shared/layouts/PublicLayout.tsx", [
		// Auth routes
		route("login", "features/auth/routes/login.tsx"),
		route("signup", "features/auth/routes/signup.tsx"),
		route("verify-email", "features/auth/routes/verify-email.tsx"),
		route(
			"verify-email/required",
			"features/auth/routes/verify-email.required.tsx",
		),
		route(
			"resend-verification",
			"features/auth/routes/resend-verification.tsx",
		),
		route("forgot-password", "features/auth/routes/forgot-password.tsx"),
		route("reset-password", "features/auth/routes/reset-password.tsx"),
	]),

	// --- PROTECTED LAYOUT (Authentication required) ---
	layout("shared/layouts/ProtectedLayout.tsx", [
		// Standard Page Layout (Centered Container - 1280px)
		layout("shared/layouts/ContainerLayout.tsx", [
			// Features
			index("features/dashboard/routes/home.tsx"),
			route("roadmap", "features/roadmap/routes/index.tsx"),
			route("pipeline", "features/pipeline/routes/pipeline.tsx"),
			route("documents", "features/documents/routes/documents.tsx"),

			// Mentoring (Directory & Profile & Booking)
			route("mentoring", "features/mentoring/routes/mentoring.index.tsx"),
			route(
				"mentoring/bookings",
				"features/mentoring/routes/mentoring.bookings.tsx",
			),
			route(
				"mentoring/session/:sessionId/review",
				"features/mentoring/routes/mentoring.session.$sessionId.review.tsx",
			),
			route(
				"mentoring/mentors/:mentorId",
				"features/mentoring/routes/mentoring.profile.$mentorId.tsx",
			),

			// Community - Explore page
			route("communities", "features/community/routes/communities.tsx"),
			route(
				"communities/search",
				"features/community/routes/community.search.tsx",
			),

			// Diagnosis Result (Page)
			route("diagnosis/result", "features/diagnosis/routes/result.tsx"),
			route("payment/success", "features/payment/routes/success.tsx"),

			// Settlement
			route("settlement", "features/settlement/routes/index.tsx"),
			route(
				"settlement/marketplace",
				"features/settlement/routes/marketplace.tsx",
			),
			route(
				"settlement/marketplace/my",
				"features/settlement/routes/marketplace.my.tsx",
			),
			route(
				"settlement/marketplace/:templateId",
				"features/settlement/routes/marketplace.$templateId.tsx",
			),
			route(
				"settlement/editor/new",
				"features/settlement/routes/editor.new.tsx",
			),
			route(
				"settlement/editor/:templateId",
				"features/settlement/routes/editor.$templateId.tsx",
			),

			// Mentoring Apply
			route("mentoring/apply", "features/mentoring/routes/mentoring.apply.tsx"),

			// Settings
			route(
				"mentoring/settings",
				"features/mentoring/routes/mentoring.settings.tsx",
			),
			route("settings/profile", "features/users/routes/profile.tsx"),
			route("settings/privacy", "features/users/routes/settings/privacy.tsx"),
			route(
				"settings/notifications",
				"features/notifications/routes/settings.tsx",
			),
			route("profile/:username", "features/users/routes/profile.$username.tsx"),

			// Diagnosis Form
			route("diagnosis", "features/diagnosis/routes/diagnosis.tsx"),

			// Payment Checkout
			route("payment/checkout", "features/payment/routes/checkout.tsx"),

			// Map
			route("map", "features/map/routes/index.tsx"),
		]),

		// Community Detail Routes (/communities/:slug) - Full width layout
		route(
			"communities/:slug",
			"features/community/routes/communities.$slug.tsx",
			[
				index("features/community/routes/communities.$slug._index.tsx"),
				route(
					"submit",
					"features/community/routes/communities.$slug.submit.tsx",
				),
				route(
					"posts/:postId",
					"features/community/routes/communities.$slug.posts.$postId.tsx",
				),
			],
		),
	]),

	// --- APIs ---
	// Auth APIs
	route("api/auth/google", "features/auth/apis/api.google.ts"),
	route(
		"api/auth/google/callback",
		"features/auth/apis/api.google.callback.ts",
	),
	route("api/auth/github", "features/auth/apis/api.github.ts"),
	route(
		"api/auth/github/callback",
		"features/auth/apis/api.github.callback.ts",
	),
	route("api/auth/kakao", "features/auth/apis/api.kakao.ts"),
	route("api/auth/kakao/callback", "features/auth/apis/api.kakao.callback.ts"),
	route("api/auth/line", "features/auth/apis/api.line.ts"),
	route("api/auth/line/callback", "features/auth/apis/api.line.callback.ts"),
	route(
		"api/auth/forgot-password",
		"features/auth/apis/api.auth.forgot-password.ts",
	),
	route(
		"api/auth/resend-verification",
		"features/auth/apis/api.auth.resend-verification.ts",
	),
	route("api/auth/reset-password", "features/auth/apis/api.reset-password.ts"),
	route("api/users/me/avatar", "features/users/apis/api.avatar.ts"),
	route("api/users/me/profile", "features/users/apis/api.profile.ts"),
	route("api/users/me/privacy", "features/users/apis/api.privacy.ts"),

	// Storage APIs
	route("api/storage/presigned", "features/storage/apis/api.presigned.ts"),
	route("api/storage/upload", "features/storage/apis/api.upload.ts"),
	route("api/storage/confirm", "features/storage/apis/api.confirm.ts"),
	route(
		"api/storage/download/:documentId",
		"features/storage/apis/api.download.$documentId.ts",
	),
	route("api/storage/files", "features/storage/apis/api.files.ts"),
	route(
		"api/documents/:documentId",
		"features/documents/apis/api.document-detail.ts",
	),

	// Community APIs
	route("api/comments/list", "features/community/apis/api.comments.list.ts"),
	route("api/comments", "features/community/apis/api.comments.ts"),
	route(
		"api/comments/:commentId",
		"features/community/apis/api.comment-detail.ts",
	),
	route(
		"api/comments/:commentId/report",
		"features/community/apis/api.report.ts",
	),
	route("api/notifications", "features/community/apis/api.notifications.ts"),
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
	route("api/community/join", "features/community/apis/api.community.join.ts"),
	route(
		"api/notifications/subscribe",
		"features/notifications/apis/api.subscribe.ts",
	),

	// Mentoring APIs (SPEC 013-015)
	route(
		"mentoring/session/:sessionId/join",
		"features/mentoring/apis/api.mentoring.session.join.ts",
	),
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
	route("api/roadmap", "features/roadmap/apis/api.roadmap.get.ts"),
	route(
		"api/roadmap/tasks/update",
		"features/roadmap/apis/api.roadmap.update-task.ts",
	),
	route("api/roadmap/tasks/:id", "features/roadmap/apis/api.task.$id.ts"),

	// Pipeline APIs (SPEC 018)
	route("api/jobs/parse", "features/pipeline/apis/api.job-parser.ts"),
	route(
		"api/pipeline/items/update",
		"features/pipeline/apis/api.pipeline.update-item.ts",
	),
	route(
		"api/pipeline/stages",
		"features/pipeline/apis/api.pipeline.get-stages.ts",
	),
	route(
		"api/pipeline/parsers",
		"features/pipeline/apis/api.pipeline.parsers.ts",
	),

	// Map APIs (SPEC 020)
	route("api/map", "features/map/apis/api.map.get.ts"),
	route("api/map/favorites", "features/map/apis/api.favorites.get.ts"),
	route(
		"api/map/custom-markers",
		"features/map/apis/api.custom-markers.get.ts",
	),
] satisfies RouteConfig;
