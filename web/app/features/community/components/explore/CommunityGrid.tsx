import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { CommunityCard } from "./CommunityCard";
import { CommunityEmptyState } from "./CommunityEmptyState";

interface Community {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	memberCount: number;
	iconUrl: string | null;
}

interface CommunityGridProps {
	communities: Community[];
	myCommunities: { id: string; role?: string | null }[];
	nextCursor?: string | null;
	loadMore?: () => void;
	isLoadingMore?: boolean;
	search?: string;
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
	hidden: { opacity: 0, y: 10 },
	show: { opacity: 1, y: 0 },
};

export function CommunityGrid({
	communities,
	myCommunities,
	nextCursor,
	loadMore,
	isLoadingMore,
	search,
}: CommunityGridProps) {
	if (communities.length === 0) {
		return <CommunityEmptyState search={search} />;
	}

	return (
		<section>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
			>
				{communities.map((community) => {
					const membership = myCommunities.find((c) => c.id === community.id);
					const isJoined = !!membership;
					const isOwner = membership?.role === "owner";
					return (
						<motion.div
							key={community.id}
							variants={itemVariants}
							initial="hidden"
							animate="show"
							layout
						>
							<CommunityCard
								community={community}
								isJoined={isJoined}
								isOwner={isOwner}
							/>
						</motion.div>
					);
				})}
			</motion.div>

			{/* Load More Button */}
			{loadMore && nextCursor && (
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={loadMore}
						disabled={isLoadingMore}
						className="group flex items-center gap-2 rounded-full bg-gray-100 px-6 py-2.5 font-bold text-gray-600 text-sm transition-all hover:bg-gray-200 disabled:opacity-50"
					>
						{isLoadingMore ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
								Loading...
							</>
						) : (
							<>
								Show more
								<Compass className="h-4 w-4 transition-transform group-hover:rotate-45" />
							</>
						)}
					</button>
				</div>
			)}
		</section>
	);
}
