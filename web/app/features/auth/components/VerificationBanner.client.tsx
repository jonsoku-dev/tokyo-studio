import { useState } from "react";
import { useFetcher } from "react-router";

/**
 * SPEC 002: Email Verification Banner
 *
 * Displays a persistent banner at the top of the page reminding users
 * to verify their email. Includes a resend button for convenience.
 *
 * Usage:
 * <VerificationBanner user={user} />
 */

interface VerificationBannerProps {
	/** Current user object */
	user: {
		email: string;
		emailVerified: boolean;
	} | null;
	/** Allow user to dismiss the banner (will reappear on next page load) */
	dismissible?: boolean;
}

export function VerificationBanner({
	user,
	dismissible = false,
}: VerificationBannerProps) {
	const [isDismissed, setIsDismissed] = useState(false);
	const fetcher = useFetcher();

	// Don't show banner if:
	// - User is not logged in
	// - User is already verified
	// - Banner has been dismissed
	if (!user || user.emailVerified || isDismissed) {
		return null;
	}

	const isResending = fetcher.state === "submitting";
	const resendSuccess = fetcher.data?.success;

	return (
		<div className="border-yellow-200 border-b bg-yellow-50">
			<div className="container-wide px-responsive py-3">
				<div className="flex flex-wrap items-center justify-between">
					<div className="flex w-0 flex-1 items-center">
						{/* Warning Icon */}
						<span className="flex rounded-lg bg-yellow-100 p-2">
							<svg
								className="h-5 w-5 text-yellow-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-labelledby="warning-icon-title"
							>
								<title id="warning-icon-title">Warning</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</span>

						{/* Message */}
						<p className="ml-3 font-medium text-yellow-800">
							<span className="md:hidden">Please verify your email</span>
							<span className="hidden md:inline">
								{resendSuccess ? (
									<>
										✓ Verification email sent to <strong>{user.email}</strong>.
										Please check your inbox.
									</>
								) : (
									<>
										Please verify your email address to unlock all features.
										Check your inbox at <strong>{user.email}</strong>
									</>
								)}
							</span>
						</p>
					</div>

					{/* Actions */}
					<div className="flex flex-shrink-0 items-center gap-3">
						{!resendSuccess && (
							<fetcher.Form
								method="post"
								action="/api/auth/resend-verification"
							>
								<button
									type="submit"
									disabled={isResending}
									className="rounded-md bg-yellow-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isResending ? "Sending..." : "Resend Email"}
								</button>
							</fetcher.Form>
						)}

						{dismissible && (
							<button
								type="button"
								onClick={() => setIsDismissed(true)}
								className="flex rounded-md p-2 transition-colors hover:bg-yellow-100"
								aria-label="Dismiss banner"
							>
								<svg
									aria-labelledby="dismiss-icon-title"
									className="h-5 w-5 text-yellow-600"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<title id="dismiss-icon-title">Dismiss</title>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Compact version of verification banner for inline use
 */
export function VerificationBannerCompact({
	user,
}: Pick<VerificationBannerProps, "user">) {
	const fetcher = useFetcher();

	if (!user || user.emailVerified) {
		return null;
	}

	const isResending = fetcher.state === "submitting";

	return (
		<div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
			<div className="flex items-start">
				<svg
					className="h-5 w-5 text-yellow-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-labelledby="warning-icon"
				>
					<title id="warning-icon">Warning</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>

				<div className="ml-3 flex-1">
					<h3 className="font-medium text-sm text-yellow-800">
						Email not verified
					</h3>
					<p className="mt-1 text-sm text-yellow-700">
						Some features are limited until you verify {user.email}
					</p>
					<fetcher.Form
						method="post"
						action="/api/auth/resend-verification"
						className="mt-2"
					>
						<button
							type="submit"
							disabled={isResending}
							className="font-medium text-sm text-yellow-800 underline hover:text-yellow-900 disabled:opacity-50"
						>
							{isResending ? "Sending..." : "Resend verification email"}
						</button>
					</fetcher.Form>
				</div>
			</div>
		</div>
	);
}
