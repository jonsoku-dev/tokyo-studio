import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("features/dashboard/routes/home.tsx"),
    route("users", "features/users/routes/users.tsx"),
    route("users/:userId", "features/users/routes/detail.tsx"),
    route("content", "features/content/routes/posts.tsx"),
    route("mentors/applications", "features/mentoring/routes/applications.tsx"),

    // Admin APIs
    route(
        "api/review/:reviewId/moderate",
        "features/mentoring/apis/api.review.moderate.ts",
    ),
] satisfies RouteConfig;
