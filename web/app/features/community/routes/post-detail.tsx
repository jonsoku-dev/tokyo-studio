import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
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
		"newest";

	const post = await communityService.getPost(postId, userId);
	if (!post) throw new Response("Post not found", { status: 404 });

	const { comments: initialComments, nextCursor } = await commentsService.getComments(
		postId,
		userId,
		commentSort,
		null, // parentId (top-level)
		null, // cursor (initial)
		5,    // limit
	);

	return { post, initialComments, nextCursor, currentUserId: userId, commentSort };
}

export default function PostDetail() {
	const { post, initialComments, nextCursor, currentUserId, commentSort } =
		useLoaderData<typeof loader>();

	return (
		<div className="stack-lg">
			{/* Post Header */}
			{/* Post Header & Content */}
		<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
			{/* Left Column: Post & Comments */}
			<div className="stack-lg min-w-0">
				{/* Post Header & Content */}
				<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div className="flex gap-4">
						<div className="hidden pt-2 sm:block">
							<VoteControl
								id={post.id}
								type="post"
								initialScore={post.score || 0}
								initialVote={post.userVote}
							/>
						</div>
						<div className="flex-1 min-w-0">
							{/* Mobile Vote Control */}
							<div className="mb-4 sm:hidden">
								<VoteControl
									id={post.id}
									type="post"
									initialScore={post.score || 0}
									initialVote={post.userVote}
									size="sm"
								/>
							</div>

							{/* Metadata */}
							<div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
								<span className="font-medium text-gray-900">
									r/{post.category || "general"}
								</span>
								<span>•</span>
								<span className="text-gray-400">
									작성자 {post.author?.name || "알 수 없음"}
								</span>
								<span>
									{post.createdAt
										? formatDistanceToNow(new Date(post.createdAt), {
												addSuffix: true,
												locale: ko,
											})
										: ""}
								</span>
							</div>

							<h1 className="heading-3 mb-6 text-gray-900">{post.title}</h1>

							<div className="prose prose-slate max-w-none">
								<PostContent content={post.content} />
							</div>

							{/* Post Footer Actions (Like/Comment/Share/Report) */}
							<div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-4">
								<button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-gray-500 text-sm hover:bg-gray-100">
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
									댓글 {post._count?.comments || 0}개
								</button>
								<button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-gray-500 text-sm hover:bg-gray-100">
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
									</svg>
									공유
								</button>
								<button type="button" className="flex items-center gap-2 rounded px-2 py-1 text-gray-500 text-sm hover:bg-gray-100">
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
									</svg>
									저장
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Comments Section */}
				<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						{/* ... existing comment header logic ... */}
						<h2 className="heading-4 flex items-center gap-2">
							댓글
							<span className="rounded-full bg-gray-100 px-2 py-0.5 font-normal text-gray-600 text-sm">
								{post._count?.comments || 0}
							</span>
						</h2>
						<div className="flex rounded-lg bg-gray-100 p-1">
							<Link
								to="?commentSort=newest"
								className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
									commentSort === "newest"
										? "bg-white text-gray-900 shadow-sm"
										: "link-subtle"
								}`}
							>
								최신순
							</Link>
							<Link
								to="?commentSort=oldest"
								className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
									commentSort === "oldest"
										? "bg-white text-gray-900 shadow-sm"
										: "link-subtle"
								}`}
							>
								오래된순
							</Link>
							<Link
								to="?commentSort=best"
								className={`rounded-md px-3 py-1 font-medium text-xs transition-colors ${
									commentSort === "best"
										? "bg-white text-gray-900 shadow-sm"
										: "link-subtle"
								}`}
							>
								인기순
							</Link>
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
				</div>
			</div>

			{/* Right Sidebar */}
			<div className="hidden lg:block space-y-6">
				{/* About Community */}
				<div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
					<div className="bg-primary-600 px-4 py-3">
						<h3 className="font-bold text-white text-sm">커뮤니티 소개</h3>
					</div>
					<div className="p-4 stack-sm">
						<div className="flex items-center gap-3 mb-2">
							<div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
								r/
							</div>
							<span className="font-bold text-lg text-gray-900">
								{post.category || "General"}
							</span>
						</div>
						<p className="text-sm text-gray-600 leading-relaxed">
							Japan IT Job 커뮤니티에 오신 것을 환영합니다! 일본 취업을 희망하는 IT 전문가들이 정보를 공유하고 함께 성장하는 공간입니다.
						</p>
						<div className="pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
							<div className="flex flex-col">
								<span className="font-bold text-gray-900">12.5k</span>
								<span className="text-xs">멤버</span>
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-gray-900">150</span>
								<span className="text-xs">온라인</span>
							</div>
						</div>
						<Link
							to="/community/new"
							className="mt-4 block w-full rounded-full bg-primary-600 py-2 text-center text-sm font-bold text-white hover:bg-primary-700 transition-colors"
						>
							글쓰기
						</Link>
					</div>
				</div>

				{/* Google Ads Slot */}
				<div className="rounded-lg border border-gray-200 bg-white shadow-sm p-1">
				    <div className="bg-gray-50 rounded h-[250px] w-full flex flex-col items-center justify-center text-gray-400">
						<span className="text-xs font-medium uppercase tracking-wider mb-1">광고</span>
						<span className="text-sm">Google Ads (300x250)</span>
					</div>
				</div>

				{/* Community Rules (Mock) */}
				<div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
					<h3 className="font-bold text-gray-900 text-sm mb-3">커뮤니티 규칙</h3>
					<ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
						<li className="pl-1">서로 존중하고 예의를 지켜주세요.</li>
						<li className="pl-1">스팸이나 과도한 홍보는 금지됩니다.</li>
						<li className="pl-1">한국어 또는 영어를 사용해주세요.</li>
						<li className="pl-1">개인정보를 보호해주세요.</li>
					</ol>
				</div>
			</div>
		</div>
		</div>
	);
}
