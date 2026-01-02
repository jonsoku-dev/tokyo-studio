import { Search } from "lucide-react";
import { Form, useLoaderData } from "react-router";

import { getUserId } from "../../auth/utils/session.server";
import { CommunityHero } from "../components/CommunityHero";
import { CategorySection } from "../components/explore/CategorySection";
import { CommunityGrid } from "../components/explore/CommunityGrid";
import {
	getCommunities,
	getCommunityCategories,
	getUserCommunities,
} from "../services/communities.server";
import type { Route } from "./+types/communities";

export function meta() {
	return [{ title: "커뮤니티 탐색 - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await getUserId(request);
	const url = new URL(request.url);
	const search = url.searchParams.get("q");

	// Common: My Communities
	const myCommunities = userId ? await getUserCommunities(userId) : [];

	// Case 1: Search Mode
	if (search) {
		const searchResults = await getCommunities({ search, limit: 100 });
		return {
			mode: "search" as const,
			search,
			myCommunities,
			communities: searchResults.communities,
		};
	}

	// Case 2: Explore Mode (Categorized)
	const [categories, recommended] = await Promise.all([
		getCommunityCategories(),
		getCommunities({ limit: 6, categorySlug: undefined }), // Top Overall
	]);

	const categoryGroups = await Promise.all(
		categories.map(async (category) => {
			const data = await getCommunities({
				categorySlug: category.slug,
				limit: 6,
			});
			return {
				category,
				communities: data.communities,
				nextCursor: data.nextCursor,
			};
		}),
	);

	return {
		mode: "explore" as const,
		search: null,
		myCommunities,
		recommended: recommended.communities,
		categoryGroups,
	};
}

export default function Communities() {
	const data = useLoaderData<typeof loader>();
	const { myCommunities } = data;
	// const [searchParams] = useSearchParams();

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			{/* Hero Section */}
			<div className="px-4 pt-4 lg:px-8">
				<CommunityHero />
			</div>

			<div className="mx-auto mt-8 max-w-7xl px-4 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-12">
					<div className="space-y-12 lg:col-span-12 min-w-0">
						{/* Search Bar */}
						<Form method="get" className="relative group mb-12">
							<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
							<input
								type="text"
								name="q"
								defaultValue={data.search || ""}
								placeholder="Find your community..."
								className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-24 shadow-sm ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500"
							/>
							<button
								type="submit"
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-6 py-2 font-bold text-white text-sm shadow-md transition-all hover:bg-primary-700 hover:shadow-lg active:scale-95"
							>
								Search
							</button>
						</Form>

						{data.mode === "search" ? (
							/* Search Results */
							<div className="space-y-6">
								<h2 className="font-bold text-gray-900 text-xl px-2 border-l-4 border-primary-500">
									Search Results for "{data.search}"
								</h2>
								<CommunityGrid
									communities={data.communities}
									myCommunities={myCommunities}
								/>
							</div>
						) : (
							/* Explore Sections */
							<div className="space-y-16">
								{/* Recommended Section */}
								{data.recommended.length > 0 && (
									<section className="space-y-6">
										<div className="flex items-center justify-between px-2">
											<h2 className="font-bold text-gray-900 text-xl border-l-4 border-primary-500 pl-3">
												Recommended for you
											</h2>
										</div>
										<CommunityGrid
											communities={data.recommended}
											myCommunities={myCommunities}
										/>
									</section>
								)}

								{/* Category Sections */}
								{data.categoryGroups.map(
									({ category, communities, nextCursor }) => {
										if (communities.length === 0) return null;
										return (
											<CategorySection
												key={category.id}
												category={category}
												initialCommunities={communities}
												initialNextCursor={nextCursor}
												myCommunities={myCommunities}
											/>
										);
									},
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
