import { formatDistanceToNow } from "date-fns";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { CommentThread } from "~/features/community/components/CommentThread";
import { PostContent } from "~/features/community/components/PostContent";
import { VoteControl } from "~/features/community/components/VoteControl";
import { communityService } from "~/features/community/domain/community.service.server";
import { commentsService } from "~/features/community/services/comments.server";
import { Shell } from "~/shared/components/layout/Shell";
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
		<Shell>
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Post Header */}
				{/* Post Header & Content */}
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex gap-4">
					<div className="hidden sm:block pt-2">
						<VoteControl
							id={post.id}
							type="post"
							initialScore={post.score || 0}
							initialVote={post.userVote}
						/>
					</div>
					<div className="flex-1">
						{/* Mobile Vote Control (visible only on small screens) */}
						<div className="sm:hidden mb-4">
							<VoteControl
								id={post.id}
								type="post"
								initialScore={post.score || 0}
								initialVote={post.userVote}
								size="sm"
							/>
						</div>

						<div className="flex items-center space-x-2 mb-4">
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
									post.category === "review"
										? "bg-purple-100 text-purple-800"
										: post.category === "qna"
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								{post.category?.toUpperCase()}
							</span>
							<span className="text-sm text-gray-500">
								{post.createdAt
									? formatDistanceToNow(new Date(post.createdAt), {
											addSuffix: true,
										})
									: ""}
							</span>
						</div>

						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							{post.title}
						</h1>

						<div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
							<Avatar
								src={post.author?.avatarUrl || undefined}
								alt={post.author?.name || "Unknown"}
								fallback={(post.author?.name || "U")[0]}
								className="h-10 w-10"
							/>
							<div>
								<div className="text-sm font-medium text-gray-900">
									{post.author?.name || "Unknown"}
								</div>
								<div className="text-xs text-gray-500">Author</div>
							</div>
						</div>

						<div className="prose prose-orange max-w-none">
							<PostContent content={post.content} />
						</div>
					</div>
				</div>

				{/* Comments Section */}
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							Comments
							<span className="bg-gray-100 text-gray-600 text-sm font-normal py-0.5 px-2 rounded-full">
								{post._count?.comments || 0}
							</span>
						</h2>
						<div className="flex bg-gray-100 rounded-lg p-1">
							<Link
								to="?commentSort=oldest"
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
									commentSort === "oldest"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Oldest
							</Link>
							<Link
								to="?commentSort=newest"
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
									commentSort === "newest"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Newest
							</Link>
							<Link
								to="?commentSort=best"
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
									commentSort === "best"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
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
		</Shell>
	);
}
