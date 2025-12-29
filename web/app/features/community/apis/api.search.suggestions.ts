import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { getSuggestions } from "~/features/community/services/search.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");

	if (!query || query.length < 2) {
		return data({ suggestions: [] });
	}

	try {
		const suggestions = await getSuggestions(query);
		return data({ suggestions });
	} catch (error) {
		console.error("Suggestions API Error:", error);
		return data({ suggestions: [] });
	}
}
