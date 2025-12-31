import { data, type LoaderFunctionArgs } from "react-router";
import { getLocationSuggestions, getLocations } from "./api.map.locations";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const categories = url.searchParams.getAll("categories");
	const area = url.searchParams.get("area") || "tokyo";
	const search = url.searchParams.get("search") || "";
	const suggest = url.searchParams.get("suggest") === "true";

	try {
		if (suggest && search) {
			const suggestions = await getLocationSuggestions(search, area);
			return data({ suggestions });
		}

		const result = await getLocations({
			categories: categories.length > 0 ? categories : undefined,
			area,
			search: search || undefined,
		});

		return data(result, {
			headers: {
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error) {
		console.error("[Map API Error]", error);
		return data({ error: "위치 데이터를 불러올 수 없습니다" }, { status: 500 });
	}
}
