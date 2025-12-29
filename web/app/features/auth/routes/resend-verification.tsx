import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { emailService } from "../services/email.server";
import { createVerificationToken } from "../services/email-verification.server";
import { requireUserId } from "../utils/session.server";
import type { Route } from "./+types/resend-verification";

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);

	// Get user email
	const [user] = await db.select().from(users).where(eq(users.id, userId));

	if (!user) {
		throw redirect("/login");
	}

	if (user.emailVerified) {
		return redirect("/dashboard");
	}

	// Create new token and send email
	const token = await createVerificationToken(userId);
	await emailService.sendVerificationEmail(user.email, token);

	return { success: true };
}

export async function loader() {
	return redirect("/dashboard");
}
