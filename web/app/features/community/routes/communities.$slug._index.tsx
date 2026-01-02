import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { MessageCircle, PenSquare, TrendingUp } from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { getUserId } from "~/features/auth/utils/session.server";
import { cn } from "~/shared/utils/cn";
import { VoteControl } from "../components/VoteControl";
import {
	getCommunity,
	getCommunityPosts,
	type SortBy,
} from "../services/communities.server";
import type { Route } from "./+types/communities.$slug._index";

// Post type for type safety
type CommunityPost = Awaited<ReturnType<typeof getCommunityPosts>>[number];

export async function loader({ params, request }: Route.LoaderArgs) {
	const { slug } = params;
	const url = new URL(request.url);
	const sortBy = (url.searchParams.get("sort") as SortBy) || "new";
	const userId = await getUserId(request);

	const community = await getCommunity(slug);
	if (!community) {
		throw new Response("Community not found", { status: 404 });
	}

	const posts = await getCommunityPosts(community.id, sortBy, userId);

	return { posts, sortBy, communitySlug: slug };
}

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function CommunityFeed() {
	const { posts, sortBy } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	const handleSortChange = (newSort: SortBy) => {
		const params = new URLSearchParams(searchParams);
		params.set("sort", newSort);
		setSearchParams(params);
	};

	return (
		<div className="space-y-6">
			{/* Controls Bar */}
			<div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
				<div className="flex gap-1">
					{(["hot", "new", "top"] as const).map((sort) => (
						<button
							key={sort}
							type="button"
							onClick={() => handleSortChange(sort)}
							className={cn(
								"flex items-center gap-1.5 rounded-xl px-4 py-2 font-medium text-sm transition-all",
								sortBy === sort
									? "bg-primary-50 text-primary-600 shadow-inner"
									: "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
							)}
							aria-pressed={sortBy === sort}
						>
							{sort === "hot" && <TrendingUp className="h-4 w-4" />}
							{sort === "new" && "✨"}
							{sort === "top" && "🏆"}
							<span className="capitalize">
								{sort === "hot" ? "인기" : sort === "new" ? "최신" : "Top"}
							</span>
						</button>
					))}
				</div>
				<Link
					to="submit"
					className="hidden items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 font-bold text-sm text-white transition-all hover:translate-y-[-1px] hover:bg-gray-800 hover:shadow-lg sm:flex"
				>
					<PenSquare className="h-4 w-4" />
					글쓰기
				</Link>
			</div>

			{/* Posts List */}
			{posts.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center justify-center rounded-3xl border border-gray-300 border-dashed bg-gray-50/50 py-20 text-center"
				>
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
						<MessageCircle className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="mb-2 font-bold text-gray-900 text-lg">
						아직 게시물이 없습니다
					</h3>
					<p className="mb-6 max-w-sm text-gray-500 text-sm">
						이 커뮤니티의 첫 번째 게시물을 작성하고 대화를 시작해보세요!
					</p>
					<Link
						to="submit"
						className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:bg-primary-700"
					>
						<PenSquare className="h-5 w-5" />첫 게시물 작성하기
					</Link>
				</motion.div>
			) : (
				<motion.ul
					variants={containerVariants}
					initial="hidden"
					animate="show"
					className="space-y-4"
				>
					{posts.map((post: CommunityPost) => (
						<motion.li key={post.id} variants={itemVariants}>
							<article className="group relative flex gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-primary-100 hover:shadow-md hover:shadow-primary-500/5">
								{/* Vote Controls (Left Sidebar) */}
								<div className="hidden flex-col items-center gap-1 sm:flex">
									<VoteControl
										id={post.id}
										type="post"
										currentScore={post.score}
										currentVote={post.userVote ?? 0}
									/>
								</div>

								{/* Main Content */}
								<div className="min-w-0 flex-1">
									{/* Meta Header */}
									<div className="mb-2 flex items-center gap-2 text-gray-500 text-xs">
										{post.author ? (
											<span className="cursor-pointer font-semibold text-gray-900 hover:underline">
												{post.author.name}
											</span>
										) : (
											<span className="italic">익명</span>
										)}
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
										{post.isPinned && (
											<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-bold text-[10px] text-green-700 uppercase tracking-wide">
												📌 PINNED
											</span>
										)}
									</div>

									{/* Title Link */}
									<Link
										to={`posts/${post.id}`}
										className="transition-colors group-hover:text-primary-600"
									>
										<h2 className="mb-2 font-bold text-gray-900 text-lg leading-snug">
											{post.title}
										</h2>
									</Link>

									{/* Content Preview */}
									<p className="mb-4 line-clamp-2 text-gray-600 text-sm leading-relaxed">
										{post.content}
									</p>

									{/* Footer Actions */}
									<div className="flex items-center gap-4 border-gray-50 border-t pt-3">
										<Link
											to={`posts/${post.id}`}
											className="flex items-center gap-1.5 rounded-lg py-1 font-medium text-gray-500 text-xs transition-colors hover:bg-gray-100 hover:text-gray-900"
										>
											<MessageCircle className="h-4 w-4" />
											{post.commentCount} Comments
										</Link>

										{/* Mobile Vote (Visible only on mobile) */}
										<div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1 sm:hidden">
											<VoteControl
												id={post.id}
												type="post"
												currentScore={post.score}
												currentVote={post.userVote ?? 0}
												horizontal
											/>
										</div>
									</div>
								</div>

								{/* Thumbnail (if link/image) */}
								{post.ogImage && post.postType === "link" && (
									<div className="hidden shrink-0 sm:block">
										<img
											src={post.ogImage}
											alt="Link preview"
											className="h-24 w-32 rounded-xl object-cover ring-1 ring-gray-100"
										/>
									</div>
								)}
							</article>
						</motion.li>
					))}
				</motion.ul>
			)}
		</div>
	);
}
