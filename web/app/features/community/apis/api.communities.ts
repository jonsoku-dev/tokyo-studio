import { type LoaderFunctionArgs } from "react-router";
import { getCommunities } from "../services/communities.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const categorySlug = url.searchParams.get("categorySlug");
	const limit = Number(url.searchParams.get("limit")) || 6;

	const data = await getCommunities({
		cursor,
		limit,
		categorySlug: categorySlug || undefined,
	});

	return data;
}
