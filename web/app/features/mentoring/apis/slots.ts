import type { LoaderFunctionArgs } from "react-router";
import { MentorService } from "~/features/mentoring/services/mentor.server";
import { loaderHandler, BadRequestError } from "~/shared/lib";

export const loader = loaderHandler(async ({ request, params }: LoaderFunctionArgs) => {
	const mentorId = params.id;
	if (!mentorId) {
		throw new BadRequestError("Mentor ID required");
	}

	const url = new URL(request.url);
	const date = url.searchParams.get("date") || new Date().toISOString();
	// Simple range: date to date+7
	const startDate = new Date(date);
	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 7);

	const slots = await MentorService.getAvailability(
		mentorId,
		startDate,
		endDate,
	);
	return { slots };
});
