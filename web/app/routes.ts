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

			// Onboarding Routes
			route(
				"onboarding/assessment",
				"features/onboarding/routes/assessment.tsx",
			),
			route("onboarding/result", "features/onboarding/routes/result.tsx"),

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
	route("api/auth/google", "features/auth/apis/api.google.server.ts"),
	route(
		"api/auth/google/callback",
		"features/auth/apis/api.google.callback.server.ts",
	),
	route("api/auth/github", "features/auth/apis/api.github.server.ts"),
	route(
		"api/auth/github/callback",
		"features/auth/apis/api.github.callback.server.ts",
	),
	route("api/auth/kakao", "features/auth/apis/api.kakao.server.ts"),
	route(
		"api/auth/kakao/callback",
		"features/auth/apis/api.kakao.callback.server.ts",
	),
	route("api/auth/line", "features/auth/apis/api.line.server.ts"),
	route(
		"api/auth/line/callback",
		"features/auth/apis/api.line.callback.server.ts",
	),
	route(
		"api/auth/forgot-password",
		"features/auth/apis/api.auth.forgot-password.server.ts",
	),
	route(
		"api/auth/resend-verification",
		"features/auth/apis/api.auth.resend-verification.server.ts",
	),
	route(
		"api/auth/reset-password",
		"features/auth/apis/api.reset-password.server.ts",
	),
	route("api/users/me/avatar", "features/users/apis/api.avatar.server.ts"),
	route("api/users/me/profile", "features/users/apis/api.profile.server.ts"),
	route("api/users/me/privacy", "features/users/apis/api.privacy.server.ts"),

	// Storage APIs
	route(
		"api/storage/presigned",
		"features/storage/apis/api.presigned.server.ts",
	),
	route("api/storage/upload", "features/storage/apis/api.upload.server.ts"),
	route("api/storage/confirm", "features/storage/apis/api.confirm.server.ts"),
	route(
		"api/storage/download/:documentId",
		"features/storage/apis/api.download.$documentId.server.ts",
	),
	route("api/storage/files", "features/storage/apis/api.files.server.ts"),
	route(
		"api/documents/:documentId",
		"features/documents/apis/api.document-detail.server.ts",
	),

	// Community APIs
	route(
		"api/comments/list",
		"features/community/apis/api.comments.list.server.ts",
	),
	route("api/comments", "features/community/apis/api.comments.server.ts"),
	route(
		"api/comments/:commentId",
		"features/community/apis/api.comment-detail.server.ts",
	),
	route(
		"api/comments/:commentId/report",
		"features/community/apis/api.report.server.ts",
	),
	route(
		"api/notifications",
		"features/community/apis/api.notifications.server.ts",
	),
	route("api/search", "features/community/apis/api.search.server.ts"),
	route(
		"api/search/suggestions",
		"features/community/apis/api.search.suggestions.server.ts",
	),
	route(
		"api/setup-search",
		"features/community/apis/api.setup-search.server.ts",
	),
	route(
		"api/setup-voting",
		"features/community/apis/api.setup-voting.server.ts",
	),
	route(
		"api/setup-reputation",
		"features/community/apis/api.setup-reputation.server.ts",
	),
	route("api/communities", "features/community/apis/api.communities.server.ts"),
	route("api/vote", "features/community/apis/api.vote.server.ts"),
	route(
		"api/community/join",
		"features/community/apis/api.community.join.server.ts",
	),
	route(
		"api/notifications/subscribe",
		"features/notifications/apis/api.subscribe.server.ts",
	),
	route(
		"api/notifications/trigger",
		"features/notifications/apis/api.notifications.trigger.server.ts",
	),
	route(
		"api/notifications/process-queue",
		"features/notifications/apis/api.notifications.process-queue.server.ts",
	),

	// Mentoring APIs (SPEC 013-015)
	route(
		"mentoring/session/:sessionId/join",
		"features/mentoring/apis/api.mentoring.session.join.server.ts",
	),
	route(
		"api/mentoring/session/:sessionId/review",
		"features/mentoring/apis/api.mentoring.review.submit.server.ts",
	),
	route(
		"api/mentoring/mentor/:mentorId/reviews",
		"features/mentoring/apis/api.mentoring.reviews.get.server.ts",
	),
	route(
		"api/mentoring/review/:reviewId/response",
		"features/mentoring/apis/api.mentoring.review.response.server.ts",
	),

	// route(\"api/notifications/settings\", \"features/notifications/apis/settings.ts\"), // TODO: Implement settings API

	// Roadmap APIs (SPEC 016)
	route("api/roadmap", "features/roadmap/apis/api.roadmap.get.server.ts"),
	route(
		"api/roadmap/tasks/update",
		"features/roadmap/apis/api.roadmap.update-task.server.ts",
	),
	route(
		"api/roadmap/tasks/:id",
		"features/roadmap/apis/api.task.$id.server.ts",
	),

	// Pipeline APIs (SPEC 018)
	route("api/jobs/parse", "features/pipeline/apis/api.job-parser.server.ts"),
	route(
		"api/pipeline/items/update",
		"features/pipeline/apis/api.pipeline.update-item.server.ts",
	),
	route(
		"api/pipeline/stages",
		"features/pipeline/apis/api.pipeline.get-stages.server.ts",
	),
	route(
		"api/pipeline/parsers",
		"features/pipeline/apis/api.pipeline.parsers.server.ts",
	),

	// Map APIs (SPEC 020)
	route("api/map", "features/map/apis/api.map.get.server.ts"),
	route("api/map/favorites", "features/map/apis/api.favorites.get.server.ts"),
	route(
		"api/map/custom-markers",
		"features/map/apis/api.custom-markers.get.server.ts",
	),

	// Advertisement APIs (SPEC 024)
	route("api/ads/serve", "features/ads/apis/ads.server.ts"),

	// Dashboard APIs (SPEC 026)
	route("api/dashboard/widgets", "features/dashboard/apis/widgets.server.ts"),
	route(
		"api/dashboard/widget-data",
		"features/dashboard/apis/widget-data.server.ts",
	),
] satisfies RouteConfig;
