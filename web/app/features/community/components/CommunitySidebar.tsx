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
import { OwnerBadge } from "~/shared/components/ui/OwnerBadge";
import {
	SidebarCard,
	SidebarCardBody,
	SidebarCardFooter,
	SidebarCardHeader,
} from "~/shared/components/ui/SidebarCard";
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
	const isOwner = userRole === "owner";

	return (
		<aside
			className="hidden space-y-4 lg:block"
			aria-label="Community Information and Tools"
		>
			{/* About Community Card */}
			<SidebarCard aria-labelledby="about-community-heading">
				<SidebarCardHeader
					icon={<Info className="h-4 w-4" />}
					title="About Community"
				/>
				<SidebarCardBody>
					{/* Community Identity */}
					<div className="mb-4 flex items-center gap-3">
						<div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-black/5">
							{community.iconUrl ? (
								<img
									src={community.iconUrl}
									alt={`Icon of ${community.name}`}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center font-bold text-xl text-primary-400">
									{community.name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<div className="min-w-0">
							<h2 className="truncate font-bold text-gray-900">
								{community.name}
							</h2>
							<p className="truncate text-gray-500 text-sm">
								@{community.slug}
							</p>
						</div>
					</div>

					{/* Description */}
					<p className="mb-4 line-clamp-3 text-gray-600 text-sm leading-relaxed">
						{community.description ||
							"Japan IT Job 커뮤니티에 오신 것을 환영합니다!"}
					</p>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-4 border-gray-100 border-t pt-4">
						<div className="flex flex-col">
							<div className="mb-0.5 flex items-center gap-1.5 text-gray-400 text-xs">
								<Users className="h-3.5 w-3.5" />
								<span>Members</span>
							</div>
							<span className="font-bold text-gray-900">
								{community.memberCount.toLocaleString()}
							</span>
						</div>
						<div className="flex flex-col">
							<div className="mb-0.5 flex items-center gap-1.5 text-gray-400 text-xs">
								<Calendar className="h-3.5 w-3.5" />
								<span>Created</span>
							</div>
							<span className="font-bold text-gray-900">
								{community.createdAt
									? formatDistanceToNow(new Date(community.createdAt), {
											locale: ko,
										})
									: "-"}
							</span>
						</div>
					</div>
				</SidebarCardBody>

				{/* Footer with Actions */}
				<SidebarCardFooter className="space-y-2">
					{currentUserId ? (
						<>
							{/* Owner Badge */}
							{isOwner ? (
								<OwnerBadge className="w-full justify-center py-2" />
							) : (
								/* Join/Leave Button - only for non-owners */
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
											"flex w-full items-center justify-center gap-2 rounded-lg py-2 font-bold text-sm transition-all",
											optimisticJoined
												? "bg-gray-100 text-gray-600 hover:bg-gray-200"
												: "bg-primary-600 text-white hover:bg-primary-700",
										)}
										aria-label={
											optimisticJoined
												? `Leave ${community.name}`
												: `Join ${community.name}`
										}
									>
										{isPending ? (
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										) : optimisticJoined ? (
											"가입됨"
										) : (
											"커뮤니티 가입"
										)}
									</button>
								</fetcher.Form>
							)}

							{/* Write Button - for all joined members including owner */}
							{(optimisticJoined || isOwner) && (
								<Link
									to={`/communities/${community.slug}/submit`}
									className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 font-bold text-gray-700 text-sm hover:bg-gray-50"
								>
									<PenSquare className="h-4 w-4" />
									글쓰기
								</Link>
							)}
						</>
					) : (
						<Link
							to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
							className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 font-bold text-sm text-white hover:bg-primary-700"
						>
							로그인하고 가입하기
						</Link>
					)}
				</SidebarCardFooter>
			</SidebarCard>

			{/* Community Rules */}
			{community.rules && community.rules.length > 0 && (
				<SidebarCard aria-labelledby="rules-heading">
					<SidebarCardHeader
						icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
						title="커뮤니티 규칙"
					/>
					<SidebarCardBody>
						<ol className="list-inside list-decimal space-y-2">
							{community.rules.map((rule) => (
								<li
									key={rule.id}
									className="text-gray-700 text-sm leading-snug marker:font-bold marker:text-gray-400"
								>
									<span className="font-medium">{rule.title}</span>
									{rule.description && (
										<p className="mt-0.5 text-gray-500 text-xs">
											{rule.description}
										</p>
									)}
								</li>
							))}
						</ol>
					</SidebarCardBody>
				</SidebarCard>
			)}

			{/* Google Ads Slot (Mock) */}
			<SidebarCard className="p-1" aria-label="Advertisement">
				<div className="flex h-[200px] w-full flex-col items-center justify-center rounded-2xl bg-gray-50">
					<span className="mb-2 font-bold text-[10px] text-gray-300 uppercase tracking-widest">
						Sponsored
					</span>
					<div className="h-24 w-24 rounded-lg bg-gray-200/50" />
					<span className="mt-3 text-gray-400 text-xs">Google Ads Space</span>
				</div>
			</SidebarCard>

			{/* Mod Tools - Only for moderators and owner */}
			{isModerator && (
				<SidebarCard variant="warning" aria-labelledby="mod-tools-heading">
					<SidebarCardHeader
						variant="warning"
						icon={<Shield className="h-4 w-4 text-yellow-700" />}
						title={<span className="text-yellow-800">관리자 도구</span>}
					/>
					<SidebarCardBody>
						<nav className="space-y-1">
							<Link
								to={`/communities/${community.slug}/about/edit`}
								className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-yellow-800 transition-colors hover:bg-yellow-100/50"
							>
								<div className="flex items-center gap-2">
									<Settings className="h-4 w-4 opacity-70" />
									<span>커뮤니티 설정</span>
								</div>
								<ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
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
					</SidebarCardBody>
				</SidebarCard>
			)}
		</aside>
	);
}
