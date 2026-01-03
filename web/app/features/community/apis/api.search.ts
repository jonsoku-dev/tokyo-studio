import type { LoaderFunctionArgs } from "react-router";
import { searchPosts } from "~/features/community/services/search.server";
import { loaderHandler } from "~/shared/lib";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");
	const category = url.searchParams.get("category") || "all";
	const time = url.searchParams.get("time") || "all";
	const sort = url.searchParams.get("sort") || "relevance";

	if (!query) {
		return { results: [], count: 0 };
	}

	const results = await searchPosts({
		query,
		category,
		time,
		sort,
	});
	return { results, count: results.length };
});
