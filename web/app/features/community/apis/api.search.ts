import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { searchPosts } from "~/features/community/services/search.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");
	const category = url.searchParams.get("category") || "all";
	const time = url.searchParams.get("time") || "all";
	const sort = url.searchParams.get("sort") || "relevance";

	if (!query) {
		return data({ results: [], count: 0 });
	}

	try {
		const results = await searchPosts({
			query,
			category,
			time,
			sort,
		});
		return data({ results, count: results.length });
	} catch (error) {
		console.error("Search API Error:", error);
		return data({ error: "Failed to search" }, { status: 500 });
	}
}
