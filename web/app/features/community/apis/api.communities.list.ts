import { data, type LoaderFunctionArgs } from "react-router";
import { getCommunities } from "../services/communities.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");
	const limit = Number(url.searchParams.get("limit")) || 20;

	const { communities, nextCursor } = await getCommunities({
		cursor,
		limit,
	});

	return data({ communities, nextCursor });
}
