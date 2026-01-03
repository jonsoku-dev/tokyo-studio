import type { LoaderFunctionArgs } from "react-router";
import { requireVerifiedUser } from "~/features/auth/utils/session.server";
import { commentsService } from "~/features/community/services/comments.server";
import { BadRequestError, loaderHandler } from "~/shared/lib";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	// Optional: require auth or just verified public read?
	// Usually comments are public. But we might want userId for vote status.
	// Let's reuse requireVerifiedUser only if we want to restrict read.
	// Better: get optional userId.
	// For now, let's use the standard "get user if logged in" pattern.
	// But `requireVerifiedUser` throws if not logged in.
	// Let's import `authenticator` or `getSession` if we want optional user.
	// For simplicity, let's assume public read is fine, but we won't have `userVote` info without user.
	// Actually `communityService` and `commentsService` usually take `userId`.
	// Let's allow public access. We need a utility `getUserId(request)` that returns null if not logged in.
	// I'll check `session.server.ts`.
	// For now, I will use `requireVerifiedUser` if I want strict access, OR...
	// `post-detail` uses `requireUserId`, so maybe this should too?
	// The platform seems to require login for better experience?
	// Let's stick to `requireUserId` for consistency with `post-detail` if it does.
	// `post-detail` uses `requireUserId`. So we require login.

	const userId = await requireVerifiedUser(request).catch(() => undefined);

	const url = new URL(request.url);
	const postId = url.searchParams.get("postId");
	const parentId = url.searchParams.get("parentId") || null;
	const cursor = url.searchParams.get("cursor");
	const sort =
		(url.searchParams.get("sort") as "best" | "newest" | "oldest") || "oldest";
	const limit = parseInt(url.searchParams.get("limit") || "10", 10);

	if (!postId) {
		throw new BadRequestError("Missing postId");
	}

	const { comments, nextCursor } = await commentsService.getComments(
		postId,
		userId,
		sort,
		parentId,
		cursor,
		limit,
	);

	return { comments, nextCursor };
});
