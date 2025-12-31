import type { LoaderFunctionArgs } from "react-router";
import { MentorService } from "~/features/mentoring/services/mentor.server";
import { loaderHandler } from "~/shared/lib";

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const filters = {
		jobFamily: url.searchParams.get("jobFamily") || undefined,
		level: url.searchParams.get("level") || undefined,
		priceMin: Number(url.searchParams.get("priceMin")) || undefined,
		priceMax: Number(url.searchParams.get("priceMax")) || undefined,
		search: url.searchParams.get("search") || undefined,
	};

	const mentors = await MentorService.searchMentors(filters);
	return { mentors };
});
