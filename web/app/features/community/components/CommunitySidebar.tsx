import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
	AlertTriangle,
	Calendar,
	ExternalLink,
	Flag,
	Info,
	PenSquare,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import { Link, useFetcher, useLocation } from "react-router";
import { cn } from "~/shared/utils/cn";

interface CommunityRule {
	id: string;
	title: string;
	description: string | null;
}

interface Community {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	iconUrl: string | null;
	memberCount: number;
	createdAt: Date | string | null;
	rules?: CommunityRule[];
}

interface CommunitySidebarProps {
	community: Community;
	isJoined: boolean;
	userRole: string | null;
	currentUserId: string | null;
}

export function CommunitySidebar({
	community,
	isJoined,
	userRole,
	currentUserId,
}: CommunitySidebarProps) {
	const fetcher = useFetcher();
	const location = useLocation();

	const isPending = fetcher.state !== "idle";
	const optimisticJoined = fetcher.formData
		? fetcher.formData.get("intent") === "join"
		: isJoined;

	const isModerator = userRole && ["moderator", "owner"].includes(userRole);

	return (
		<aside
			className="hidden space-y-6 lg:block"
			aria-label="Community Information and Tools"
		>
			{/* About Community Card */}
			<section
				className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-gray-200/50 shadow-lg"
				aria-labelledby="about-community-heading"
			>
				{/* Header with Pattern */}
				<div className="relative h-16 overflow-hidden bg-primary-600">
					<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
					<div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-indigo-600 opacity-90" />
					<div className="absolute bottom-3 left-4 flex items-center gap-2 text-white/90">
						<Info className="h-4 w-4" />
						<h3
							id="about-community-heading"
							className="font-bold text-sm tracking-wide"
						>
							About Community
						</h3>
					</div>
				</div>

				<div className="p-5">
					{/* Community Identity */}
					<div className="mb-4 flex items-center gap-4">
						<div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner ring-1 ring-black/5">
							{community.iconUrl ? (
								<img
									src={community.iconUrl}
									alt={`Icon of ${community.name}`}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center font-bold text-2xl text-primary-300">
									{community.name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<div className="min-w-0">
							<h2 className="truncate font-bold text-gray-900 text-xl">
								{community.name}
							</h2>
							<p className="truncate font-medium text-gray-500 text-sm">
								r/{community.slug}
							</p>
						</div>
					</div>

					{/* Description */}
					<p className="mb-6 line-clamp-4 text-gray-600 text-sm leading-relaxed">
						{community.description ||
							"Japan IT Job 커뮤니티에 오신 것을 환영합니다! 자유롭게 정보를 공유하고, 함께 성장하는 공간이 되기를 바랍니다."}
					</p>

					{/* Stats Grid */}
					<div className="mb-6 grid grid-cols-2 gap-4 border-gray-100 border-y py-4">
						<div className="flex flex-col items-start">
							<div className="mb-1 flex items-center gap-1.5 font-medium text-gray-400 text-xs">
								<Users className="h-3.5 w-3.5" />
								<span>Members</span>
							</div>
							<span className="font-bold text-gray-900 text-lg">
								{community.memberCount.toLocaleString()}
							</span>
						</div>
						<div className="flex flex-col items-start">
							<div className="mb-1 flex items-center gap-1.5 font-medium text-gray-400 text-xs">
								<Calendar className="h-3.5 w-3.5" />
								<span>Created</span>
							</div>
							<span className="font-bold text-gray-900 text-lg">
								{community.createdAt
									? formatDistanceToNow(new Date(community.createdAt), {
											locale: ko,
										})
									: "-"}
							</span>
						</div>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						{currentUserId ? (
							<>
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
										className={cn(
											"flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm transition-all duration-200",
											optimisticJoined
												? "bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200 hover:text-red-500"
												: "bg-primary-600 text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30",
										)}
										aria-label={
											optimisticJoined
												? `Leave ${community.name}`
												: `Join ${community.name}`
										}
										aria-pressed={optimisticJoined}
									>
										{isPending ? (
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										) : optimisticJoined ? (
											<>
												<span>가입됨</span>
												<span className="hidden group-hover:inline">
													(탈퇴)
												</span>
											</>
										) : (
											"커뮤니티 가입"
										)}
									</button>
								</fetcher.Form>

								{optimisticJoined && (
									<Link
										to={`/communities/${community.slug}/submit`}
										className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 font-bold text-gray-700 text-sm ring-1 ring-transparent transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
									>
										<PenSquare className="h-4 w-4" />
										글쓰기
									</Link>
								)}
							</>
						) : (
							<Link
								to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 font-bold text-sm text-white shadow-md shadow-primary-500/20 transition-all hover:bg-primary-700"
							>
								로그인하고 가입하기
							</Link>
						)}
					</div>
				</div>
			</section>

			{/* Community Rules */}
			{community.rules && community.rules.length > 0 && (
				<section
					className="rounded-3xl border border-gray-100 bg-white p-5 shadow-gray-200/50 shadow-lg"
					aria-labelledby="rules-heading"
				>
					<div className="mb-4 flex items-center gap-2 border-gray-100 border-b pb-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
							<AlertTriangle className="h-4 w-4" />
						</div>
						<h3 id="rules-heading" className="font-bold text-gray-900 text-sm">
							커뮤니티 규칙
						</h3>
					</div>
					<ol className="list-inside list-decimal space-y-3">
						{community.rules.map((rule) => (
							<li
								key={rule.id}
								className="pl-1 text-gray-600 text-sm leading-snug marker:font-bold marker:text-gray-400"
							>
								<span className="font-medium text-gray-800">{rule.title}</span>
								{rule.description && (
									<p className="mt-1 ml-0 block pl-0 font-normal text-gray-500 text-xs">
										{rule.description}
									</p>
								)}
							</li>
						))}
					</ol>
				</section>
			)}

			{/* Google Ads Slot (Mock) */}
			<section
				className="rounded-3xl border border-gray-100 bg-white p-1 shadow-sm"
				aria-label="Advertisement"
			>
				<div className="flex h-[250px] w-full flex-col items-center justify-center rounded-2xl bg-gray-50/50">
					<span className="mb-2 font-bold text-[10px] text-gray-300 uppercase tracking-widest">
						Sponsored
					</span>
					<div className="h-32 w-32 rounded-lg bg-gray-200/50" />
					<span className="mt-4 text-gray-400 text-xs">Google Ads Space</span>
				</div>
			</section>

			{/* Mod Tools - Only for moderators and owner */}
			{isModerator && (
				<section
					className="rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-5"
					aria-labelledby="mod-tools-heading"
				>
					<div className="mb-4 flex items-center gap-2">
						<Shield className="h-4 w-4 text-yellow-700" />
						<h3
							id="mod-tools-heading"
							className="font-bold text-sm text-yellow-800"
						>
							관리자 도구
						</h3>
					</div>
					<nav className="space-y-1">
						<Link
							to={`/communities/${community.slug}/about/edit`}
							className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-yellow-800 transition-colors hover:bg-yellow-100/50"
						>
							<div className="flex items-center gap-2">
								<Settings className="h-4 w-4 opacity-70" />
								<span>커뮤니티 설정</span>
							</div>
							<ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
						</Link>
						<Link
							to={`/communities/${community.slug}/about/modqueue`}
							className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-yellow-800 transition-colors hover:bg-yellow-100/50"
						>
							<div className="flex items-center gap-2">
								<Flag className="h-4 w-4 opacity-70" />
								<span>신고 대기열</span>
							</div>
							<div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/20 font-bold text-[10px] text-red-700">
								2
							</div>
						</Link>
						<Link
							to={`/communities/${community.slug}/about/members`}
							className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-yellow-800 transition-colors hover:bg-yellow-100/50"
						>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 opacity-70" />
								<span>멤버 관리</span>
							</div>
						</Link>
					</nav>
				</section>
			)}
		</aside>
	);
}
