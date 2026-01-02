import { motion } from "framer-motion";
import { Check, ChevronLeft, MoreHorizontal, Share2 } from "lucide-react";
import { Link, Outlet, useFetcher, useLoaderData } from "react-router";
import { getUserId } from "../../auth/utils/session.server";
import { CommunitySidebar } from "../components/CommunitySidebar";
import {
	getCommunityWithRules,
	getUserRole,
	hasJoined,
} from "../services/communities.server";
import type { Route } from "./+types/communities.$slug";

export async function loader({ request, params }: Route.LoaderArgs) {
	const userId = await getUserId(request);
	const { slug } = params;

	const community = await getCommunityWithRules(slug);
	if (!community) {
		throw new Response("Community not found", { status: 404 });
	}

	const isJoined = await hasJoined(userId, community.id);
	const userRole = await getUserRole(userId, community.id);

	return {
		community,
		isJoined,
		userRole,
		currentUserId: userId,
	};
}

export function meta({ data }: Route.MetaArgs) {
	if (!data?.community) {
		return [{ title: "커뮤니티를 찾을 수 없습니다" }];
	}
	return [
		{ title: `r/${data.community.slug} - ${data.community.name}` },
		{ name: "description", content: data.community.description || "" },
	];
}

export default function CommunityLayout() {
	const { community, isJoined, userRole, currentUserId } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const isPending = fetcher.state !== "idle";
	const optimisticJoined = fetcher.formData
		? fetcher.formData.get("intent") === "join"
		: isJoined;

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			{/* Banner Region */}
			<div className="relative h-48 w-full overflow-hidden md:h-64 lg:h-80">
				{community.bannerUrl ? (
					<motion.div
						initial={{ scale: 1.05 }}
						animate={{ scale: 1 }}
						transition={{ duration: 1.5, ease: "easeOut" }}
						className="absolute inset-0 bg-center bg-cover"
						style={{ backgroundImage: `url(${community.bannerUrl})` }}
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-800" />
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
			</div>

			{/* Sticky Header */}
			<header className="sticky top-0 z-40 border-gray-200 border-b bg-white/80 shadow-sm backdrop-blur-md transition-all">
				<div className="mx-auto max-w-7xl px-4 lg:px-6">
					<div className="flex h-16 items-center justify-between">
						{/* Left: Branding & Back */}
						<div className="flex items-center gap-4">
							<Link
								to="/communities"
								className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
								aria-label="Back to Communities"
							>
								<ChevronLeft className="h-5 w-5" />
							</Link>

							{/* Community Icon (Visible on scroll or always tiny in header) */}
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
									{community.iconUrl ? (
										<img
											src={community.iconUrl}
											alt=""
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-primary-100 font-bold text-primary-600 text-xs">
											{community.name.charAt(0).toUpperCase()}
										</div>
									)}
								</div>
								<div className="hidden sm:block">
									<h1 className="font-bold text-gray-900 text-sm lg:text-base">
										{community.name}
									</h1>
									<p className="font-medium text-gray-500 text-xs">
										r/{community.slug}
									</p>
								</div>
							</div>
						</div>

						{/* Right: Actions */}
						<div className="flex items-center gap-3">
							{currentUserId && (
								<fetcher.Form method="post" action="/api/community/join">
									<input
										type="hidden"
										name="communityId"
										value={community.id}
									/>
									<input
										type="hidden"
										name="intent"
										value={optimisticJoined ? "leave" : "join"}
									/>
									<button
										type="submit"
										disabled={isPending}
										className={`group relative overflow-hidden rounded-full px-5 py-1.5 font-semibold text-sm transition-all duration-300 ${
											optimisticJoined
												? "border border-gray-200 bg-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50"
												: "bg-primary-600 text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30"
										}`}
									>
										<span className="relative z-10 flex items-center gap-1.5">
											{isPending ? (
												<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											) : optimisticJoined ? (
												<>
													<span>Joined</span>
													<Check className="h-3.5 w-3.5" />
												</>
											) : (
												"Join Community"
											)}
										</span>
									</button>
								</fetcher.Form>
							)}
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
								aria-label="Share Community"
							>
								<Share2 className="h-4 w-4" />
							</button>
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
								aria-label="Community Menu"
							>
								<MoreHorizontal className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content Layout */}
			<div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
				<div className="grid gap-8 lg:grid-cols-12">
					{/* Left Content Area (Feed/Detail) */}
					<main className="min-w-0 lg:col-span-8" id="main-content">
						<Outlet />
					</main>

					{/* Right Sidebar Area */}
					<div className="lg:col-span-4">
						<div className="sticky top-24">
							<CommunitySidebar
								community={community}
								isJoined={optimisticJoined}
								userRole={userRole}
								currentUserId={currentUserId}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
