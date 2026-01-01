import { format } from "date-fns";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { SearchBar } from "~/features/community/components/SearchBar";
import { SearchFilters } from "~/features/community/components/SearchFilters";
import { searchPosts } from "~/features/community/services/search.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
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
		<div>
			<PageHeader title="Search Results" className="mb-8" />
			<div className="mb-8">
				<SearchBar />
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
				{/* Filters Sidebar */}
				<div className="md:col-span-1">
					<SearchFilters />
				</div>

				{/* Results List */}
				<div className="stack-md md:col-span-3">
					{query && results.length === 0 && (
						<div className="rounded-lg bg-gray-50 py-12 text-center">
							<p className="text-gray-500">No results found for "{query}"</p>
							<p className="mt-2 text-gray-400 text-sm">
								Try adjusting your filters or search terms.
							</p>
						</div>
					)}

					{results.map((post) => (
						<Link
							key={post.id}
							to={`/community/${post.id}`}
							className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
						>
							<div className="mb-2 flex items-start justify-between">
								<h2 className="heading-5 text-primary-600 hover:underline">
									{post.title}
								</h2>
								<Badge variant="outline" className="capitalize">
									{post.category}
								</Badge>
							</div>

							{/* Excerpt with highlights */}
							<div
								className="mb-4 line-clamp-3 text-gray-600 text-sm"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized by Postres ts_headline but caution needed
								dangerouslySetInnerHTML={{ __html: post.excerpt }}
							/>

							<div className="caption flex items-center gap-4">
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
	);
}
