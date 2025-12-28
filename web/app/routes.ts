
import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("features/dashboard/routes/home.tsx"),
	route("login", "features/auth/routes/login.tsx"),
	route("signup", "features/auth/routes/signup.tsx"),
	route("pipeline", "features/pipeline/routes/pipeline.tsx"),
	route("documents", "features/documents/routes/documents.tsx"),
	route("documents/new", "features/documents/routes/new.tsx"),
	route("mentoring", "features/mentoring/routes/mentoring.tsx"),
	route("mentoring/book", "features/mentoring/routes/book.tsx"),
	route("mentoring/schedule", "features/mentoring/routes/schedule.tsx"),
	route("community", "features/community/routes/community.tsx"),
	route("community/new", "features/community/routes/new.tsx"),
	route("diagnosis", "features/diagnosis/routes/diagnosis.tsx"),
	route("diagnosis/result", "features/diagnosis/routes/result.tsx"),
	route("payment/checkout", "features/payment/routes/checkout.tsx"),
	route("payment/success", "features/payment/routes/success.tsx"),
	route("api/storage/presigned", "features/storage/routes/presigned.ts"),
	route("auth/google", "features/auth/routes/google.ts"),
	route("auth/google/callback", "features/auth/routes/google.callback.ts"),
	route("auth/github", "features/auth/routes/github.ts"),
	route("auth/github/callback", "features/auth/routes/github.callback.ts"),
	route("auth/kakao", "features/auth/routes/kakao.ts"),
	route("auth/kakao/callback", "features/auth/routes/kakao.callback.ts"),
	route("auth/line", "features/auth/routes/line.ts"),
	route("auth/line/callback", "features/auth/routes/line.callback.ts"),
] satisfies RouteConfig;
