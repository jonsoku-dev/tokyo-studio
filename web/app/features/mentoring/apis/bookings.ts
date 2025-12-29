import { type ActionFunctionArgs, data } from "react-router";
import { requireVerifiedUser } from "~/features/auth/utils/session.server";
import { BookingService } from "~/features/mentoring/services/booking.server";

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireVerifiedUser(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	try {
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
			return data({ session });
		}

		if (intent === "confirm") {
			const sessionId = formData.get("sessionId") as string;
			// In real world, verify payment intent here
			const session = await BookingService.confirmBooking(sessionId);
			return data({ success: true, session });
		}

		return data({ error: "Invalid intent" }, { status: 400 });
	} catch (error) {
		console.error("Booking error:", error);
		const message = error instanceof Error ? error.message : "Booking failed";
		return data({ error: message }, { status: 500 });
	}
}
