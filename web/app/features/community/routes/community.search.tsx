import { format } from "date-fns";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { SearchBar } from "~/features/community/components/SearchBar";
import { SearchFilters } from "~/features/community/components/SearchFilters";
import { searchPosts } from "~/features/community/services/search.server";
import { Shell } from "~/shared/components/layout/Shell";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Badge } from "~/shared/components/ui/Badge";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");
	const category = url.searchParams.get("category") || "all";
	const time = url.searchParams.get("time") || "all";
	const sort = url.searchParams.get("sort") || "relevance";

	if (!query) {
		return { results: [], query: "" };
	}

	const results = await searchPosts({
		query,
		category,
		time,
		sort,
	});

	return { results, query };
}

export default function SearchPage() {
	const { results, query } = useLoaderData<typeof loader>();

	return (
		<Shell>
			<div className="max-w-5xl mx-auto py-8 px-4">
				<div className="mb-8">
					<h1 className="text-2xl font-bold mb-4">Search Results</h1>
					<SearchBar />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Filters Sidebar */}
					<div className="md:col-span-1">
						<SearchFilters />
					</div>

					{/* Results List */}
					<div className="md:col-span-3 space-y-6">
						{query && results.length === 0 && (
							<div className="text-center py-12 bg-gray-50 rounded-lg">
								<p className="text-gray-500">No results found for "{query}"</p>
								<p className="text-sm text-gray-400 mt-2">
									Try adjusting your filters or search terms.
								</p>
							</div>
						)}

						{results.map((post) => (
							<Link
								key={post.id}
								to={`/community/${post.id}`}
								className="block bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
							>
								<div className="flex justify-between items-start mb-2">
									<h2 className="text-lg font-semibold text-blue-600 hover:underline">
										{post.title}
									</h2>
									<Badge variant="outline" className="capitalize">
										{post.category}
									</Badge>
								</div>

								{/* Excerpt with highlights */}
								<div
									className="text-gray-600 mb-4 text-sm line-clamp-3"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized by Postres ts_headline but caution needed
									dangerouslySetInnerHTML={{ __html: post.excerpt }}
								/>

								<div className="flex items-center text-xs text-gray-500 gap-4">
									<div className="flex items-center gap-2">
										<Avatar
											src={post.authorAvatar || undefined}
											alt={post.authorName || "User"}
											fallback={(post.authorName || "U")[0]}
											className="h-5 w-5"
										/>
										<span>{post.authorName}</span>
									</div>
									<span>
										{format(new Date(post.createdAt || ""), "MMM d, yyyy")}
									</span>
									{Boolean(post.rank) && (
										<span className="text-gray-300">
											Rank: {Number(post.rank).toFixed(2)}
										</span>
									)}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</Shell>
	);
}
