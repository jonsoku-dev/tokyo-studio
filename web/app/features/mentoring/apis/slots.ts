import { data, type LoaderFunctionArgs } from "react-router";
import { MentorService } from "~/features/mentoring/services/mentor.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const mentorId = params.id;
	if (!mentorId) {
		throw new Response("Mentor ID required", { status: 400 });
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
	return data({ slots });
}
