import type { ActionFunctionArgs } from "react-router";
import { requireVerifiedUser } from "~/features/auth/utils/session.server";
import { BookingService } from "~/features/mentoring/services/booking.server";
import { actionHandler, BadRequestError } from "~/shared/lib";

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const userId = await requireVerifiedUser(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "lock") {
		const mentorId = formData.get("mentorId") as string;
		const date = new Date(formData.get("date") as string);
		const duration = Number(formData.get("duration"));
		const price = Number(formData.get("price"));
		const topic = formData.get("topic") as string;

		const session = await BookingService.lockSlot(
			mentorId,
			userId,
			date,
			duration,
			price,
			topic,
		);
		return { session };
	}

	if (intent === "confirm") {
		const sessionId = formData.get("sessionId") as string;
		const session = await BookingService.confirmBooking(sessionId);
		return { session };
	}

	throw new BadRequestError("Invalid intent");
});
