import { formatDistanceToNow } from "date-fns";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { CommentThread } from "~/features/community/components/CommentThread";
import { PostContent } from "~/features/community/components/PostContent";
import { VoteControl } from "~/features/community/components/VoteControl";
import { communityService } from "~/features/community/domain/community.service.server";
import { commentsService } from "~/features/community/services/comments.server";

import { Avatar } from "~/shared/components/ui/Avatar";
import type { Route } from "./+types/post-detail";

export async function loader({ request, params }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const { postId } = params;
	if (!postId) throw new Error("Post ID is required");

	const url = new URL(request.url);
	const commentSort =
		(url.searchParams.get("commentSort") as "best" | "oldest" | "newest") ||
		"oldest";

	const post = await communityService.getPost(postId, userId);
	if (!post) throw new Response("Post not found", { status: 404 });

	const comments = await commentsService.getComments(
		postId,
		userId,
		commentSort,
	);

	return { post, comments, currentUserId: userId, commentSort };
}

export default function PostDetail() {
	const { post, comments, currentUserId, commentSort } =
		useLoaderData<typeof loader>();

	return (
		<div className="stack-lg mx-auto max-w-4xl">
			{/* Post Header */}
			{/* Post Header & Content */}
			<div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div className="hidden pt-2 sm:block">
					<VoteControl
						id={post.id}
						type="post"
						initialScore={post.score || 0}
						initialVote={post.userVote}
					/>
				</div>
				<div className="flex-1">
					{/* Mobile Vote Control (visible only on small screens) */}
					<div className="mb-4 sm:hidden">
						<VoteControl
							id={post.id}
							type="post"
							initialScore={post.score || 0}
							initialVote={post.userVote}
							size="sm"
						/>
					</div>

					<div className="mb-4 flex items-center space-x-2">
						<span
							className={`inline-flex items-center rounded px-2 py-0.5 font-medium text-xs ${
								post.category === "review"
									? "bg-purple-100 text-purple-800"
									: post.category === "qna"
										? "bg-primary-100 text-primary-800"
										: "bg-gray-100 text-gray-800"
							}`}
						>
							{post.category?.toUpperCase()}
						</span>
						<span className="caption">
							{post.createdAt
								? formatDistanceToNow(new Date(post.createdAt), {
										addSuffix: true,
									})
								: ""}
						</span>
					</div>

					<h1 className="heading-2 mb-4 text-gray-900">{post.title}</h1>

					<div className="mb-6 flex items-center space-x-3 border-gray-100 border-b pb-6">
						<Avatar
							src={post.author?.avatarUrl || undefined}
							alt={post.author?.name || "Unknown"}
							fallback={(post.author?.name || "U")[0]}
							className="h-10 w-10"
						/>
						<div>
							<div className="heading-5 text-sm">
								{post.author?.name || "Unknown"}
							</div>
							<div className="caption">Author</div>
						</div>
					</div>

					<div className="prose prose-orange max-w-none">
						<PostContent content={post.content} />
					</div>
				</div>
			</div>

			{/* Comments Section */}
			<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="heading-4 flex items-center gap-2">
						Comments
						<span className="rounded-full bg-gray-100 px-2 py-0.5 font-normal text-gray-600 text-sm">
							{post._count?.comments || 0}
						</span>
					</h2>
					<div className="flex rounded-lg bg-gray-100 p-1">
						<Link
							to="?commentSort=oldest"
							className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
								commentSort === "oldest"
									? "bg-white text-gray-900 shadow-sm"
									: "link-subtle"
							}`}
						>
							Oldest
						</Link>
						<Link
							to="?commentSort=newest"
							className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
								commentSort === "newest"
									? "bg-white text-gray-900 shadow-sm"
									: "link-subtle"
							}`}
						>
							Newest
						</Link>
						<Link
							to="?commentSort=best"
							className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
								commentSort === "best"
									? "bg-white text-gray-900 shadow-sm"
									: "link-subtle"
							}`}
						>
							Best
						</Link>
					</div>
				</div>
				<CommentThread
					comments={comments}
					currentUserId={currentUserId}
					postId={post.id}
				/>
			</div>
		</div>
	);
}
