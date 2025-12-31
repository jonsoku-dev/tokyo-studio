import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { passwordResetService } from "../services/password-reset.server";
import { actionHandler, ValidationError } from "~/shared/lib";

const ForgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const email = String(formData.get("email"));

	const result = ForgotPasswordSchema.safeParse({ email });

	if (!result.success) {
		throw new ValidationError(result.error.flatten().fieldErrors);
	}

	try {
		// Get IP for rate limiting (simplified for MVP/Local)
		const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";

		await passwordResetService.createResetToken(result.data.email, ipAddress);
		return { success: true };
	} catch (error) {
		console.error("Forgot Password Error:", error);
		// Return success even on error to prevent enumeration (or generic error)
		return { success: true };
	}
});
