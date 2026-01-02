import type { LoaderFunctionArgs } from "react-router";
import { getSuggestions } from "~/features/community/services/search.server";
import { loaderHandler } from "~/shared/lib";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");

	if (!query || query.length < 2) {
		return { suggestions: [] };
	}

	try {
		const suggestions = await getSuggestions(query);
		return { suggestions };
	} catch (error) {
		console.error("Suggestions API Error:", error);
		return { suggestions: [] }; // Fail gracefully
	}
});
