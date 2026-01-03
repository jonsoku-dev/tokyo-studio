import type { WidgetLayout } from "@itcom/db/schema";
import { MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface CommunityHighlightsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Community Highlights Widget (P2)
 * 인기 커뮤니티 게시글
 */
export default function CommunityHighlightsWidget({
	size: _size,
	widgetData,
}: CommunityHighlightsWidgetProps) {
	const { posts } = widgetData.community;

	const maxItems = _size === "compact" ? 2 : _size === "standard" ? 3 : 5;
	const displayPosts = posts.slice(0, maxItems);

	return (
		<div className="space-y-3">
			{/* 헤더 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-primary-600" />
					<span className="font-medium text-gray-700 text-sm">인기 게시글</span>
				</div>
				<Link
					to="/communities"
					className="text-primary-600 text-xs hover:text-primary-700"
				>
					전체 보기 →
				</Link>
			</div>

			{/* 게시글 목록 */}
			{displayPosts.length > 0 ? (
				<div className="space-y-2">
					{displayPosts.map((post, index) => (
						<Link
							key={post.id}
							to={`/communities/posts/${post.id}`}
							className="group block rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
						>
							<div className="mb-2 flex items-start justify-between gap-2">
								<p className="line-clamp-2 font-medium text-gray-900 text-sm transition-colors group-hover:text-primary-700">
									{index < 3 && post.score > 50 && (
										<span className="mr-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-red-700 text-xs">
											HOT
										</span>
									)}
									{post.title}
								</p>
							</div>
							<div className="flex items-center gap-3 text-gray-500 text-xs">
								<span className="flex items-center gap-1">
									<ThumbsUp className="h-3 w-3" />
									{post.score}
								</span>
								<span className="flex items-center gap-1">
									<MessageSquare className="h-3 w-3" />
									{post.commentCount}
								</span>
								{post.authorName && (
									<span className="text-gray-400">by {post.authorName}</span>
								)}
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className="py-responsive text-center text-gray-400">
					<MessageSquare className="mx-auto mb-2 h-8 w-8" />
					<p className="text-sm">아직 게시글이 없습니다</p>
					<Link
						to="/communities"
						className="mt-2 inline-block font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						커뮤니티 둘러보기 →
					</Link>
				</div>
			)}
		</div>
	);
}
