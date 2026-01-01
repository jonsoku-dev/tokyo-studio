import { redirect } from "react-router";
import { verifyToken } from "~/features/auth/services/email-verification.server";
import { getUserSession, storage } from "~/features/auth/utils/session.server";
import type { Route } from "./+types/verify-email";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (!token) {
		return { success: false, error: "Missing token" };
	}

	const result = await verifyToken(token);

	if (result.success) {
		// Optional: Log the user in automatically or set a flash message
		const session = await getUserSession(request);
		session.flash(
			"success",
			"Email successfully verified! You can now access all features.",
		);

		return redirect("/dashboard", {
			headers: {
				"Set-Cookie": await storage.commitSession(session),
			},
		});
	}

	return { success: false, error: result.error };
}

export default function VerifyEmail({ loaderData }: Route.ComponentProps) {
	if (loaderData.success === false) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md stack-lg text-center">
					<h2 className="heading-2">Verification Failed</h2>
					<p className="text-red-600">{loaderData.error}</p>
					<div className="mt-4">
						<a href="/login" className="text-indigo-600 hover:text-indigo-500">
							Back to Login
						</a>
					</div>
				</div>
			</div>
		);
	}

	return null; // Should redirect in loader
}
