import { motion } from "framer-motion";
import { Code2, Compass, Globe, Laptop, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher, useLoaderData } from "react-router";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css";

import { cn } from "~/shared/utils/cn";
import { getUserId } from "../../auth/utils/session.server";
import { CommunityHero } from "../components/CommunityHero";
import {
	getCommunities,
	getUserCommunities,
} from "../services/communities.server";
import type { Route } from "./+types/communities";
export function meta() {
	return [{ title: "커뮤니티 탐색 - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await getUserId(request);
	// Fetch first page (20 items)
	const props = await getCommunities({ limit: 20 });
	const myCommunities = userId ? await getUserCommunities(userId) : [];

	return {
		initialCommunities: props.communities,
		initialCursor: props.nextCursor,
		myCommunities,
	};
}

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

// Category Tabs Data
const CATEGORIES = [
	{ id: "all", label: "전체", icon: Compass },
	{ id: "tech", label: "개발/테크", icon: Code2 },
	{ id: "life", label: "일본생활", icon: Globe },
	{ id: "career", label: "취업/이직", icon: Laptop },
];

export default function Communities() {
	const { initialCommunities, initialCursor, myCommunities } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher<{
		communities: typeof initialCommunities;
		nextCursor: string | null;
	}>();

	const [communities, setCommunities] = useState(initialCommunities);
	const [nextCursor, setNextCursor] = useState(initialCursor);

	// Append data when fetcher loads more
	useEffect(() => {
		if (fetcher.data) {
			setCommunities((prev) => [...prev, ...(fetcher.data?.communities || [])]);
			setNextCursor(fetcher.data.nextCursor);
		}
	}, [fetcher.data]);

	const loadMore = () => {
		if (!nextCursor) return;
		fetcher.load(`/api/community/list?cursor=${nextCursor}&limit=20`);
	};

	const isLoadingMore = fetcher.state === "loading";

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			{/* Hero Section */}
			<div className="px-4 pt-4 lg:px-8">
				<CommunityHero />
			</div>

			<div className="mx-auto mt-8 max-w-7xl px-4 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-12">
					{/* Main Content Area */}
					<div className="space-y-12 lg:col-span-8">
						{/* Category Tabs */}
						<div
							id="all-communities"
							className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-4"
						>
							{CATEGORIES.map((cat) => {
								const isActive = 
                                    (cat.id === "all" && !new URLSearchParams(typeof window !== 'undefined' ? location.search : '').get("category")) ||
                                    new URLSearchParams(typeof window !== 'undefined' ? location.search : '').get("category") === cat.id;
                                
                                return (
								<Link
									key={cat.id}
									to={cat.id === "all" ? "." : `?category=${cat.id}`}
                                    preventScrollReset
									className={cn(
										"flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-sm shadow-sm transition-all",
										isActive
											? "bg-primary-600 text-white shadow-primary-500/20 ring-2 ring-primary-600"
											: "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-primary-600",
									)}
								>
									<cat.icon className="h-4 w-4" />
									{cat.label}
								</Link>
							)})}
						</div>

						{/* Trending Today */}
						<section id="trending">
							<div className="mb-4 flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-gray-900" />
								<h2 className="font-bold text-gray-900 text-lg">
									오늘의 트렌드
								</h2>
							</div>

							<Swiper
								modules={[Autoplay]}
								spaceBetween={20}
								slidesPerView={1.2}
								breakpoints={{
									640: { slidesPerView: 2 },
								}}
								autoplay={{ delay: 5000, disableOnInteraction: false }}
								className="w-full !overflow-visible" // Fundamental fix: allow overflow
							>
								{communities.slice(0, 5).map((community, index) => (
									<SwiperSlide key={community.id} className="py-10"> {/* Add padding for hover space */}
										<Link
											to={`/communities/${community.slug}`}
											className="group relative block h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 p-6 shadow-primary-500/20 shadow-lg transition-all hover:scale-[1.05] hover:shadow-2xl hover:shadow-primary-500/30"
										>
											<div className="relative z-10 flex h-full flex-col justify-between">
												<div className="flex items-start justify-between">
													<div>
														<h3 className="mb-1 font-bold text-white text-xl leading-none shadow-sm">
															{community.name}
														</h3>
														<p className="font-medium text-sm text-white/80">
															r/{community.slug}
														</p>
													</div>
													<span className="rounded-full bg-white/20 px-2.5 py-1 font-bold text-[10px] text-white ring-1 ring-white/30 backdrop-blur-md">
														Trending
													</span>
												</div>

												<div className="flex items-center justify-between">
													<div className="flex items-center gap-1.5 rounded-lg bg-black/10 px-2 py-1 font-bold text-white/90 text-xs backdrop-blur-sm">
														<Users className="h-3.5 w-3.5" />
														{community.memberCount.toLocaleString()}
													</div>
													<div className="flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-white text-indigo-600 opacity-0 shadow-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
														<Compass className="h-4 w-4" />
													</div>
												</div>
											</div>

											{/* Modern Decor */}
											<div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
											<div className="absolute top-0 right-0 translate-x-10 -translate-y-10 rounded-full bg-white/5 p-20 blur-3xl" />
										</Link>
									</SwiperSlide>
								))}
							</Swiper>
						</section>

						{/* Recommended (Grid) */}
						<section>
							<h2 className="mb-6 font-bold text-gray-900 text-lg">
								추천 커뮤니티
							</h2>

							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="show"
								className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
							>
								{communities.map((community) => {
									const isJoined = myCommunities.some(
										(c) => c.id === community.id,
									);
									return (
										<motion.div key={community.id} variants={itemVariants}>
											<CommunityCard
												community={community}
												isJoined={isJoined}
											/>
										</motion.div>
									);
								})}
							</motion.div>

							{/* Load More Button */}
							{nextCursor && (
								<div className="mt-12 flex justify-center">
									<button
										type="button"
										onClick={loadMore}
										disabled={isLoadingMore}
										className="group flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-gray-700 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100 transition-all hover:scale-105 hover:bg-gray-50 hover:ring-gray-300 disabled:opacity-50"
									>
										{isLoadingMore ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
												불러오는 중...
											</>
										) : (
											<>
												더 보기
												<Compass className="h-4 w-4 transition-transform group-hover:rotate-45" />
											</>
										)}
									</button>
								</div>
							)}
						</section>
					</div>

					{/* Right Sidebar */}
					<div className="space-y-8 lg:col-span-4">
						{/* Ad Widget */}
						<div className="sticky top-24 space-y-6">
							<section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-gray-200/50 shadow-xl">
								<div className="flex items-center justify-between border-gray-100 border-b bg-gray-50 px-4 py-2">
									<span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
										Sponsored
									</span>
									<span className="cursor-pointer text-[10px] text-gray-300 hover:text-gray-400">
										ⓘ
									</span>
								</div>
								<div className="flex h-[250px] w-full flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
									<div className="mb-4 h-16 w-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 shadow-blue-400/20 shadow-lg" />
									<h4 className="mb-1 font-bold text-gray-900 text-sm">
										당신의 광고가 이곳에
									</h4>
									<p className="mb-4 text-gray-500 text-xs">
										IT 전문가들에게 당신의 서비스를 홍보하세요.
									</p>
									<button
										type="button"
										className="rounded-lg bg-gray-900 px-4 py-2 font-bold text-white text-xs transition-transform hover:scale-105"
									>
										문의하기
									</button>
								</div>
							</section>

							{/* Top Communities List */}
							<section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-gray-200/50 shadow-lg">
								<div className="mb-4 flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-orange-500" />
									<h3 className="font-bold text-gray-900">
										실시간 인기 커뮤니티
									</h3>
								</div>
								<div className="space-y-1">
									{communities.slice(0, 5).map((community, index) => (
										<Link
											key={community.id}
											to={`/communities/${community.slug}`}
											className="group flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-gray-50"
										>
											<div className="flex items-center gap-3">
												<span className="w-4 text-center font-bold text-gray-400 text-sm transition-colors group-hover:text-orange-500">
													{index + 1}
												</span>
												<div className="flex items-center gap-2">
													<div className="h-6 w-6 overflow-hidden rounded-full bg-gray-100">
														{community.iconUrl ? (
															<img
																src={community.iconUrl}
																alt=""
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center bg-gray-200 font-bold text-[10px] text-gray-500">
																{community.name[0]}
															</div>
														)}
													</div>
													<span className="font-medium text-gray-700 text-sm group-hover:text-gray-900">
														r/{community.slug}
													</span>
												</div>
											</div>
											<Users className="h-3 w-3 text-gray-300" />
										</Link>
									))}
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Modern Glassmorphic Community Card
interface CommunityCardProps {
	community: {
		id: string;
		slug: string;
		name: string;
		description: string | null;
		memberCount: number;
		iconUrl: string | null;
	};
	isJoined?: boolean;
}

function CommunityCard({ community, isJoined }: CommunityCardProps) {
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state !== "idle";

	// Optimistic UI
	const joined = isSubmitting
		? fetcher.formData?.get("intent") === "join"
		: isJoined;

	const handleJoinToggle = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent Link navigation
		e.stopPropagation();

		fetcher.submit(
			{
				communityId: community.id,
				intent: joined ? "leave" : "join",
			},
			{ method: "POST", action: "/api/community/join" },
		);
	};

	return (
		<Link
			to={`/communities/${community.slug}`}
			className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-gray-200/50 hover:shadow-xl"
		>
			<div className="mb-4 flex items-start justify-between">
				<div className="h-14 w-14 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-105">
					{community.iconUrl ? (
						<img
							src={community.iconUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center font-bold text-gray-400 text-xl">
							{community.name.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				{joined ? (
					<button
						type="button"
						onClick={handleJoinToggle}
						disabled={isSubmitting}
						className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 font-bold text-green-600 text-xs ring-1 ring-green-100 transition-all hover:bg-green-100 disabled:opacity-50"
					>
						Joined
					</button>
				) : (
					<button
						type="button"
						onClick={handleJoinToggle}
						disabled={isSubmitting}
						className="rounded-full bg-gray-900 px-3 py-1 font-bold text-white text-xs opacity-0 shadow-gray-900/20 shadow-lg transition-all hover:scale-105 active:scale-95 group-hover:opacity-100 disabled:opacity-50"
					>
						Join
					</button>
				)}
			</div>

			<div className="flex-1">
				<h3 className="mb-0.5 truncate font-bold text-base text-gray-900 transition-colors group-hover:text-primary-600">
					{community.name}
				</h3>
				<p className="mb-3 font-medium text-gray-400 text-xs">
					r/{community.slug}
				</p>

				<p className="mb-2 line-clamp-2 h-9 text-gray-500 text-xs leading-relaxed">
					{community.description || "함께 성장하는 커뮤니티입니다."}
				</p>
			</div>

			<div className="mt-auto flex items-center gap-1.5 border-gray-50 border-t pt-3 font-bold text-gray-400 text-xs">
				<Users className="h-3.5 w-3.5" />
				<span>
					{community.memberCount > 1000
						? `${(community.memberCount / 1000).toFixed(1)}k`
						: community.memberCount}{" "}
					members
				</span>
			</div>
		</Link>
	);
}
