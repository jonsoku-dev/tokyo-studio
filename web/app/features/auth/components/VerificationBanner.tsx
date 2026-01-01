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
		<div className="bg-yellow-50 border-b border-yellow-200">
			<div className="container-wide py-3 px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between flex-wrap">
					<div className="flex-1 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
						<p className="text-sm font-medium text-yellow-800">
							Please verify your email address ({user.email}) to unlock all
							features. Check your inbox for the verification link.
						</p>
					</div>
					<div className="flex-shrink-0 mt-2 sm:mt-0">
						<Form
							method="post"
							action="/auth/resend-verification"
							className="inline"
						>
							<button
								type="submit"
								className="px-4 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md border border-yellow-300 transition-colors"
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
