import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("users", "routes/users/users.tsx"),
    route("users/:userId", "routes/users/detail.tsx"),
    route("content", "routes/content/posts.tsx"),
] satisfies RouteConfig;
