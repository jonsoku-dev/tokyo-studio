import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
	Bookmark,
	MessageCircle,
	MoreHorizontal,
	Share2,
	User,
} from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { CommentThread } from "~/features/community/components/CommentThread";
import { PostContent } from "~/features/community/components/PostContent";
import { VoteControl } from "~/features/community/components/VoteControl";
import { communityService } from "~/features/community/domain/community.service.server";
import { commentsService } from "~/features/community/services/comments.server";
import { cn } from "~/shared/utils/cn";

import type { Route } from "./+types/communities.$slug.posts.$postId";

export async function loader({ request, params }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const { postId } = params;
	if (!postId) throw new Error("Post ID is required");

	const url = new URL(request.url);
	const commentSort =
		(url.searchParams.get("commentSort") as "best" | "oldest" | "newest") ||
		"newest";

	const post = await communityService.getPost(postId, userId);
	if (!post) throw new Response("Post not found", { status: 404 });

	const { comments: initialComments, nextCursor } =
		await commentsService.getComments(
			postId,
			userId,
			commentSort,
			null, // parentId (top-level)
			null, // cursor (initial)
			5, // limit
		);

	return {
		post,
		initialComments,
		nextCursor,
		currentUserId: userId,
		commentSort,
	};
}

export default function PostDetail() {
	const { post, initialComments, nextCursor, currentUserId, commentSort } =
		useLoaderData<typeof loader>();

	return (
		<div className="space-y-6">
			{/* Post Article */}
			<article className="rounded-3xl border border-gray-100 bg-white p-2 shadow-gray-200/50 shadow-sm">
				<div className="flex gap-4 p-4 sm:p-6">
					{/* Desktop Vote Control */}
					<div className="hidden flex-col items-center gap-2 pt-2 sm:flex">
						<VoteControl
							id={post.id}
							type="post"
							currentScore={post.score || 0}
							currentVote={post.userVote ?? 0}
						/>
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1">
						{/* Metadata */}
						<header className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-2 text-gray-500 text-xs">
								<Link
									to={`/communities/${post.category || "general"}`}
									className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 font-bold text-gray-900 transition-colors hover:bg-gray-200"
								>
									@{post.category || "general"}
								</Link>
								<span>•</span>
								<div className="flex items-center gap-1">
									<div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500">
										<User className="h-2.5 w-2.5" />
									</div>
									<span className="font-medium text-gray-700">
										{post.author?.name || "익명"}
									</span>
								</div>
								<span>•</span>
								<time
									dateTime={
										post.createdAt
											? new Date(post.createdAt).toISOString()
											: undefined
									}
								>
									{post.createdAt &&
										formatDistanceToNow(new Date(post.createdAt), {
											addSuffix: true,
											locale: ko,
										})}
								</time>
							</div>

							<div className="flex items-center">
								<button
									type="button"
									className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
									aria-label="Post Options"
								>
									<MoreHorizontal className="h-4 w-4" />
								</button>
							</div>
						</header>

						{/* Title */}
						<h1 className="mb-6 font-bold text-2xl text-gray-900 leading-tight sm:text-3xl">
							{post.title}
						</h1>

						{/* Body */}
						<div className="prose prose-lg prose-slate max-w-none prose-img:rounded-2xl prose-a:text-primary-600 prose-p:leading-relaxed hover:prose-a:text-primary-700">
							<PostContent content={post.content} />
						</div>

						{/* Mobile Vote & Actions */}
						<div className="mt-8 flex flex-col gap-4 sm:hidden">
							<div className="flex w-fit items-center gap-2 rounded-lg bg-gray-50 p-1">
								<VoteControl
									id={post.id}
									type="post"
									currentScore={post.score || 0}
									currentVote={post.userVote ?? 0}
									horizontal
								/>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="mt-8 flex items-center gap-2 border-gray-100 border-t pt-4">
							<button
								type="button"
								className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 font-bold text-gray-600 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
							>
								<MessageCircle className="h-4 w-4" />
								<span>댓글 {post._count?.comments || 0}</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 font-bold text-gray-600 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
							>
								<Share2 className="h-4 w-4" />
								<span>공유</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 font-bold text-gray-600 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
							>
								<Bookmark className="h-4 w-4" />
								<span>저장</span>
							</button>
						</div>
					</div>
				</div>
			</article>

			{/* Comments Section */}
			<section
				className="rounded-3xl border border-gray-100 bg-white p-6 shadow-gray-200/50 shadow-sm"
				aria-labelledby="comments-heading"
			>
				<div className="mb-8 flex items-center justify-between border-gray-100 border-b pb-4">
					<h2
						id="comments-heading"
						className="flex items-center gap-2 font-bold text-gray-900 text-lg"
					>
						댓글
						<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600 text-sm">
							{post._count?.comments || 0}
						</span>
					</h2>
					<div className="flex items-center gap-1 rounded-lg bg-gray-100/50 p-1">
						{(["newest", "oldest", "best"] as const).map((sort) => (
							<Link
								key={sort}
								to={`?commentSort=${sort}`}
								className={cn(
									"rounded-md px-3 py-1.5 font-bold text-xs transition-all",
									commentSort === sort
										? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5"
										: "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900",
								)}
								aria-current={commentSort === sort ? "page" : undefined}
							>
								{sort === "newest"
									? "최신순"
									: sort === "oldest"
										? "오래된순"
										: "인기순"}
							</Link>
						))}
					</div>
				</div>

				<CommentThread
					key={commentSort}
					initialComments={initialComments}
					initialNextCursor={nextCursor}
					currentUserId={currentUserId}
					postId={post.id}
					sort={commentSort}
				/>
			</section>
		</div>
	);
}
