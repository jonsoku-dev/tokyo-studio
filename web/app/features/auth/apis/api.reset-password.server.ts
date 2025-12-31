import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordResetService } from "../services/password-reset.server";
import type { Route } from "./+types/api.reset-password.server";
import { actionHandler, ValidationError } from "~/shared/lib";

const ResetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
});

export const action = actionHandler(async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const token = String(formData.get("token"));
	const password = String(formData.get("password"));

	const result = ResetPasswordSchema.safeParse({ token, password });

	if (!result.success) {
		throw new ValidationError({ password: result.error.issues[0].message });
	}

	const hashedPassword = await bcrypt.hash(result.data.password, 10);

	// Extract request metadata for security notification (SPEC 003 FR-010)
	const ipAddress =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("x-real-ip") ||
		"Unknown";
	const userAgent = request.headers.get("user-agent") || "";

	await passwordResetService.completePasswordReset(
		result.data.token,
		hashedPassword,
		{
			ipAddress,
			userAgent,
		},
	);
	return { success: true };
});
