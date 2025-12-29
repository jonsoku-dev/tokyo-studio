import { Link, useLoaderData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
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
		<Shell>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Community</h1>
					<div className="flex items-center space-x-4">
						<div className="flex bg-gray-100 rounded-lg p-1">
							<Link
								to="?sort=recent"
								className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
									sortBy === "recent"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Recent
							</Link>
							<Link
								to="?sort=best"
								className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
									sortBy === "best"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Best
							</Link>
						</div>
						<Link
							to="/community/new"
							className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
						>
							Write Post
						</Link>
					</div>
				</div>

				<div className="space-y-4">
					{posts.map((post) => (
						<div
							key={post.id}
							className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
						>
							<div className="flex items-start justify-between">
								<div>
									<div className="flex items-center space-x-2 mb-2">
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
										<span className="text-xs text-gray-500">
											Posted by {post.author?.name || "Unknown"}
										</span>
										<span className="text-xs text-gray-400">•</span>
										<span className="text-xs text-gray-500">
											{post.createdAt
												? new Date(post.createdAt).toLocaleDateString()
												: ""}
										</span>
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-1">
										{post.title}
									</h3>
									<div className="text-sm text-gray-600 line-clamp-3">
										<PostContent content={`${post.content.slice(0, 200)}...`} />
									</div>
								</div>
								<div className="flex flex-col items-center justify-center bg-gray-50 p-2 rounded min-w-[60px]">
									<span className="text-lg font-bold text-gray-700">
										{post._count?.comments || 0}
									</span>
									<span className="text-xs text-gray-500">Cmts</span>
								</div>
							</div>
						</div>
					))}

					{posts.length === 0 && (
						<div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">
							No posts yet. Be the first to share!
						</div>
					)}
				</div>
			</div>
		</Shell>
	);
}
