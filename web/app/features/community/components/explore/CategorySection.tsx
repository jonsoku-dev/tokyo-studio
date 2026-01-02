import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { CommunityGrid } from "./CommunityGrid";

interface CategorySectionProps {
	category: {
		id: string;
		name: string;
		slug: string;
	};
	initialCommunities: any[];
	initialNextCursor: string | null;
	myCommunities: { id: string }[];
}

export function CategorySection({
	category,
	initialCommunities,
	initialNextCursor,
	myCommunities,
}: CategorySectionProps) {
	const [communities, setCommunities] = useState(initialCommunities);
	const [nextCursor, setNextCursor] = useState(initialNextCursor);
	const fetcher = useFetcher<any>();

	useEffect(() => {
		if (fetcher.data && fetcher.state === "idle") {
			const newCommunities = fetcher.data.communities;
			const newCursor = fetcher.data.nextCursor;

            if (newCommunities && newCommunities.length > 0) {
                 // De-duplicate by ID
                 setCommunities((prev) => {
                     const existingIds = new Set(prev.map(c => c.id));
                     const uniqueNew = newCommunities.filter((c: any) => !existingIds.has(c.id));
                     return [...prev, ...uniqueNew];
                 });
                 setNextCursor(newCursor);
            } else if (newCommunities && newCommunities.length === 0) {
                setNextCursor(null);
            }
		}
	}, [fetcher.data, fetcher.state]);

	const loadMore = () => {
		if (!nextCursor) return;
		const params = new URLSearchParams({
			categorySlug: category.slug,
			cursor: nextCursor,
			limit: "6",
		});
		fetcher.load(`/api/communities?${params.toString()}`);
	};

	const isLoading = fetcher.state === "loading";

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between px-2">
				<h2 className="font-bold text-gray-900 text-xl border-l-4 border-gray-300 pl-3">
					More like {category.name}
				</h2>
			</div>
			<CommunityGrid
				communities={communities}
				myCommunities={myCommunities}
				loadMore={nextCursor ? loadMore : undefined}
				isLoadingMore={isLoading}
				nextCursor={nextCursor}
			/>
		</section>
	);
}
