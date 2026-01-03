import type { LoaderFunctionArgs } from "react-router";
import { loaderHandler } from "~/shared/lib";
import {
	getLocationSuggestions,
	getLocations,
} from "./api.map.locations";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const categories = url.searchParams.getAll("categories");
	const area = url.searchParams.get("area") || "tokyo";
	const search = url.searchParams.get("search") || "";
	const suggest = url.searchParams.get("suggest") === "true";

	if (suggest && search) {
		const suggestions = await getLocationSuggestions(search, area);
		return { suggestions };
	}

	return getLocations({
		categories: categories.length > 0 ? categories : undefined,
		area,
		search: search || undefined,
	});
});
