import { Link, useFetcher } from "react-router";
import { cn } from "~/shared/utils/cn";

export interface CommunityCardProps {
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

export function CommunityCard({ community, isJoined }: CommunityCardProps) {
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state !== "idle";

	// Optimistic UI
	const joined = isSubmitting
		? fetcher.formData?.get("intent") === "join"
		: isJoined;

	const handleJoinToggle = (e: React.MouseEvent) => {
		e.preventDefault();
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
			className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
		>
			<div className="flex items-center gap-3 overflow-hidden">
				{/* Icon */}
				<div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
					{community.iconUrl ? (
						<img
							src={community.iconUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center font-bold text-gray-400 text-base">
							{community.name.charAt(0).toUpperCase()}
						</div>
					)}
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					<h3 className="truncate font-bold text-sm text-gray-900 group-hover:underline">
						{community.name}
					</h3>
					<div className="flex items-center gap-2 text-xs text-gray-500">
						<span className="font-medium">
							{community.memberCount.toLocaleString()} members
						</span>
					</div>
					{community.description && (
						<p className="line-clamp-1 truncate text-gray-400 text-xs mt-0.5">
							{community.description}
						</p>
					)}
				</div>
			</div>

			{/* Action Button */}
			<button
				type="button"
				onClick={handleJoinToggle}
				disabled={isSubmitting}
				className={cn(
					"ml-2 shrink-0 rounded-full px-3 py-1 font-bold text-xs transition-colors disabled:opacity-50",
					joined
						? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
						: "bg-black text-white hover:bg-gray-800"
				)}
			>
				{joined ? "Joined" : "Join"}
			</button>
		</Link>
	);
}
