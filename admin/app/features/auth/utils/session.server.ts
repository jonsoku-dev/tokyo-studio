import { createCookieSessionStorage, redirect } from "react-router";

// Best Practice: Use environment variables for secrets
const sessionSecret =
	process.env.SESSION_SECRET || "default-dev-secret-do-not-use-in-prod";

export const storage = createCookieSessionStorage({
	cookie: {
		name: "jp_it_job_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
	},
});

export async function createUserSession(userId: string, redirectTo: string) {
	const session = await storage.getSession();
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
}

export async function getUserSession(request: Request) {
	return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function requireUserId(
	request: Request,
	redirectTo: string = new URL(request.url).pathname,
) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return redirect("/login", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
}

export async function requireVerifiedUser(request: Request) {
	const userId = await requireUserId(request);
	const { db } = await import("@itcom/db/client");
	const { users } = await import("@itcom/db/schema");
	const { eq } = await import("drizzle-orm");

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	// If user verified status is null, they are unverified
	if (!user || !user.emailVerified) {
		const url = new URL(request.url);
		const returnTo = encodeURIComponent(url.pathname);
		throw redirect(`/verify-email/required?returnTo=${returnTo}`);
	}

	return userId;
}

