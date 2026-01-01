/**
 * SPEC 002: Email Verification Banner
 *
 * Displays a banner to unverified users with a quick resend button
 */

import { AlertCircle } from "lucide-react";
import { Form } from "react-router";

interface VerificationBannerProps {
	user: {
		emailVerified: Date | null;
		email: string;
	};
}

export function VerificationBanner({ user }: VerificationBannerProps) {
	if (user.emailVerified) {
		return null;
	}

	return (
		<div className="border-yellow-200 border-b bg-yellow-50">
			<div className="container-wide px-4 py-3 sm:px-6 lg:px-8">
				<div className="flex flex-wrap items-center justify-between">
					<div className="flex flex-1 items-center gap-3">
						<AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
						<p className="font-medium text-sm text-yellow-800">
							Please verify your email address ({user.email}) to unlock all
							features. Check your inbox for the verification link.
						</p>
					</div>
					<div className="mt-2 flex-shrink-0 sm:mt-0">
						<Form
							method="post"
							action="/auth/resend-verification"
							className="inline"
						>
							<button
								type="submit"
								className="rounded-md border border-yellow-300 bg-yellow-100 px-4 py-1.5 font-medium text-sm text-yellow-800 transition-colors hover:bg-yellow-200"
							>
								Resend Email
							</button>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
