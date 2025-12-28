import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	// --- Pages ---
	// Dashboard
	index("features/dashboard/routes/home.tsx"),

	// Auth
	route("login", "features/auth/routes/login.tsx"),
	route("signup", "features/auth/routes/signup.tsx"),
	route("verify-email", "features/auth/routes/verify-email.tsx"),
	route("resend-verification", "features/auth/routes/resend-verification.tsx"),
	route("forgot-password", "features/auth/routes/forgot-password.tsx"),
	route("reset-password", "features/auth/routes/reset-password.tsx"),

	// Features
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
	route("api/auth/forgot-password", "features/auth/apis/forgot-password.ts"),
	route("api/auth/reset-password", "features/auth/apis/reset-password.ts"),

	// Storage APIs
	route("api/storage/presigned", "features/storage/apis/presigned.ts"),
] satisfies RouteConfig;
