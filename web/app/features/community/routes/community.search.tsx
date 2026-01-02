import { format } from "date-fns";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { SearchBar } from "~/features/community/components/SearchBar";
import { SearchFilters } from "~/features/community/components/SearchFilters";
import { searchPosts } from "~/features/community/services/search.server";
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
		<div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
			{/* Header Section */}
			<div className="mb-10 text-center">
				<h1 className="mb-2 font-bold text-3xl text-gray-900 tracking-tight">
					검색 결과
				</h1>
				<p className="text-gray-500">원하는 정보를 파인드 하세요</p>
			</div>

			<div className="mx-auto mb-10 max-w-2xl">
				<SearchBar />
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12">
				{/* Filters Sidebar */}
				<div className="lg:col-span-1">
					<div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-gray-200/50 shadow-sm">
						<SearchFilters />
					</div>
				</div>

				{/* Results List */}
				<div className="space-y-4 lg:col-span-3">
					{query && results.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 border-dashed bg-gray-50/50 py-20 text-center">
							<div className="mb-4 text-4xl">🔍</div>
							<h3 className="font-bold text-gray-900 text-lg">
								"{query}"에 대한 결과가 없습니다
							</h3>
							<p className="mt-1 text-gray-500 text-sm">
								다른 키워드로 검색하거나 필터를 조정해보세요.
							</p>
						</div>
					)}

					{results.map((post) => (
						<Link
							key={post.id}
							to={`/communities/${post.category || "general"}/posts/${post.id}`}
							className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5"
						>
							<div className="mb-3 flex items-start justify-between gap-4">
								<h2 className="line-clamp-1 font-bold text-gray-900 text-lg transition-colors group-hover:text-primary-600">
									<span
										dangerouslySetInnerHTML={{
											__html: post.title.replace(
												new RegExp(query || "", "gi"),
												(match) =>
													`<mark class="bg-primary-100 text-primary-800 rounded-sm px-0.5">${match}</mark>`,
											),
										}}
									/>
								</h2>
								<Badge
									variant="secondary"
									className="shrink-0 bg-gray-100 text-gray-600 capitalize transition-colors group-hover:bg-primary-50 group-hover:text-primary-600"
								>
									r/{post.category}
								</Badge>
							</div>

							{/* Excerpt with highlights */}
							<div
								className="mb-4 line-clamp-2 text-gray-600 text-sm leading-relaxed"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized by Postres ts_headline but caution needed
								dangerouslySetInnerHTML={{ __html: post.excerpt }}
							/>

							<div className="flex items-center justify-between text-gray-500 text-xs">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<Avatar
											src={post.authorAvatar || undefined}
											alt={post.authorName || "User"}
											fallback={(post.authorName || "U")[0]}
											className="h-5 w-5 ring-1 ring-gray-100"
										/>
										<span className="font-medium text-gray-700">
											{post.authorName || "익명"}
										</span>
									</div>
									<span>•</span>
									<span>
										{format(new Date(post.createdAt || ""), "yyyy.MM.dd")}
									</span>
								</div>

								{Boolean(post.rank) && (
									<div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-400">
										<span className="font-bold text-[10px] uppercase tracking-wider">
											Rel
										</span>
										<span>{Number(post.rank).toFixed(1)}</span>
									</div>
								)}
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
