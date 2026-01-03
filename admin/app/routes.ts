import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("features/dashboard/routes/home.tsx"),
	route("users", "features/users/routes/users.tsx"),
	route("users/:userId", "features/users/routes/detail.tsx"),
	route("content", "features/content/routes/posts.tsx"),
	route("mentors/applications", "features/mentoring/routes/applications.tsx"),

	// Roadmap Admin
	route("roadmap/templates", "features/roadmap/routes/templates.tsx"),
	route("roadmap/templates/new", "features/roadmap/routes/template.new.tsx"),
	route("roadmap/templates/:id", "features/roadmap/routes/template.$id.tsx"),
	route("roadmap/analytics", "features/roadmap/routes/analytics.tsx"),
	route(
		"api/roadmap/preview-targeting",
		"features/roadmap/apis/api.preview-targeting.ts",
	),

	// Community Admin
	route("communities/categories", "features/community/routes/categories.tsx"),

	// Admin APIs
	route(
		"api/review/:reviewId/moderate",
		"features/mentoring/apis/api.review.moderate.ts",
	),
] satisfies RouteConfig;
