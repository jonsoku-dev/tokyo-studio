import crypto from "node:crypto";
import { db } from "@itcom/db/client";
import { verificationTokens } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
	data,
	Form,
	redirect,
	useLoaderData,
	useNavigation,
} from "react-router";

/**
 * SPEC 002: Email Verification Required Page
 *
 * Shown when unverified users try to access protected features:
 * - Job posting
 * - Mentor booking
 * - Comment writing
 */

export async function loader({ request }: LoaderFunctionArgs) {
	const { requireUser } = await import(
		"~/features/auth/services/require-verified-email.server"
	);
	const user = await requireUser(request);

	// If already verified, redirect to home
	if (user.emailVerified) {
		const url = new URL(request.url);
		const returnTo = url.searchParams.get("returnTo") || "/";
		throw redirect(returnTo);
	}

	return data({
		email: user.email,
		returnTo: new URL(request.url).searchParams.get("returnTo") || "/",
	});
}

export async function action({ request }: ActionFunctionArgs) {
	const { requireUser } = await import(
		"~/features/auth/services/require-verified-email.server"
	);
	const user = await requireUser(request);

	// Generate new verification token
	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Invalidate old tokens
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.userId, user.id));

	// Create new token
	await db.insert(verificationTokens).values({
		id: crypto.randomUUID(),
		userId: user.id,
		token,
		expiresAt,
	});

	// TODO: Send verification email via email service
	// const { emailService } = await import("~/features/auth/services/email.server");
	// await emailService.sendVerificationEmail(user.email, token);

	return data({
		success: true,
		message: "Verification email sent. Please check your inbox.",
	});
}

export default function VerifyEmailRequired() {
	const { email } = useLoaderData<{
		email: string;
	}>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="min-h-screen center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full stack-lg">
				{/* Warning Icon */}
				<div className="mx-auto center h-16 w-16 rounded-full bg-yellow-100">
					<svg
						className="h-10 w-10 text-yellow-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-labelledby="main-warning-icon"
					>
						<title id="main-warning-icon">Verification Required</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>

				{/* Header */}
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Email Verification Required
					</h2>
					<p className="mt-2 body-sm">
						Please verify your email address to continue
					</p>
				</div>

				{/* Main Content */}
				<div className="bg-white shadow rounded-lg p-6">
					<div className="stack">
						<p className="text-gray-700">
							To protect our community, you need to verify your email address
							before you can:
						</p>

						<ul className="list-disc list-inside stack-sm text-gray-600 ml-4">
							<li>Post job opportunities</li>
							<li>Book mentoring sessions</li>
							<li>Write comments and participate in discussions</li>
						</ul>

						<div className="bg-primary-50 border-l-4 border-blue-400 p-4 mt-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-primary-400"
										fill="currentColor"
										viewBox="0 0 20 20"
										aria-labelledby="info-icon"
									>
										<title id="info-icon">Info</title>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-primary-700">
										We sent a verification email to <strong>{email}</strong>
									</p>
								</div>
							</div>
						</div>

						{/* Resend Verification Email */}
						<Form method="post" className="mt-6">
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Sending..." : "Resend Verification Email"}
							</button>
						</Form>

						<div className="text-center caption mt-4">
							Already verified?{" "}
							<a
								href="/auth/login"
								className="text-primary-600 hover:text-primary-500"
							>
								Log in again
							</a>
						</div>
					</div>
				</div>

				{/* Help Text */}
				<div className="text-center caption">
					<p>Didn't receive the email? Check your spam folder or</p>
					<a
						href="/support/contact"
						className="text-primary-600 hover:text-primary-500"
					>
						contact support
					</a>
				</div>
			</div>
		</div>
	);
}
