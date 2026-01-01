import { Link, useLoaderData } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { requireUserId } from "../../auth/utils/session.server";
import { PostContent } from "../components/PostContent";
import { communityService } from "../domain/community.service.server";
import type { CommunityPost } from "../domain/community.types";

export function meta() {
	return [{ title: "Community - Japan IT Job" }];
}

export async function loader({ request }: { request: Request }) {
	await requireUserId(request);
	const url = new URL(request.url);
	const sortBy =
		(url.searchParams.get("sort") as "best" | "recent") || "recent";
	const posts = await communityService.getPosts(undefined, sortBy);
	return { posts, sortBy };
}

export default function Community() {
	const { posts, sortBy } = useLoaderData<{
		posts: CommunityPost[];
		sortBy: "best" | "recent";
	}>();

	return (
		<div className="stack">
			<PageHeader
				title="커뮤니티"
				actions={
					<div className="flex items-center space-x-4">
						<div className="flex rounded-lg bg-gray-100 p-1">
							<Link
								to="?sort=recent"
								className={`rounded-md px-3 py-1 font-medium text-sm transition-colors ${
									sortBy === "recent"
										? "bg-white text-gray-900 shadow-sm"
										: "link-subtle"
								}`}
							>
								최신순
							</Link>
							<Link
								to="?sort=best"
								className={`rounded-md px-3 py-1 font-medium text-sm transition-colors ${
									sortBy === "best"
										? "bg-white text-gray-900 shadow-sm"
										: "link-subtle"
								}`}
							>
								인기순
							</Link>
						</div>
						<Link
							to="/community/new"
							className="rounded-md bg-primary-600 px-4 py-2 font-medium text-sm text-white hover:bg-primary-700"
						>
							글쓰기
						</Link>
					</div>
				}
			/>

			<div className="stack">
				{posts.map((post) => (
					<Link
						key={post.id}
						to={`/community/${post.id}`}
						className="block cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300"
					>
						<div className="flex items-start justify-between">
							<div>
								<div className="mb-2 flex items-center space-x-2">
									<span
										className={`inline-flex items-center rounded px-2 py-0.5 font-medium text-xs ${
											post.category === "review"
												? "bg-purple-100 text-purple-800"
												: post.category === "qna"
													? "bg-primary-100 text-primary-800"
													: "bg-gray-100 text-gray-800"
										}`}
									>
										{post.category === "review"
											? "리뷰"
											: post.category === "qna"
												? "질문답변"
												: "일반"}
									</span>
									<span className="caption">
										{post.author?.name || "알 수 없음"}
									</span>
									<span className="caption">•</span>
									<span className="caption">
										{post.createdAt
											? new Date(post.createdAt).toLocaleDateString()
											: ""}
									</span>
								</div>
								<h3 className="heading-5 mb-1">{post.title}</h3>
								<div className="body-sm line-clamp-3">
									<PostContent content={`${post.content.slice(0, 200)}...`} />
								</div>
							</div>
							<div className="flex min-w-[60px] flex-col items-center justify-center rounded bg-gray-50 p-2">
								<span className="heading-5 text-gray-700">
									{post._count?.comments || 0}
								</span>
								<span className="caption">댓글</span>
							</div>
						</div>
					</Link>
				))}

				{posts.length === 0 && (
					<div className="rounded-lg border border-gray-200 bg-white py-10 text-center text-gray-500">
						아직 게시물이 없습니다. 첫 번째 글을 작성해보세요!
					</div>
				)}
			</div>
		</div>
	);
}
