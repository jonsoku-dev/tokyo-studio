import { useState } from "react";
import { Link, useFetcher } from "react-router";

import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";
import { passwordResetService } from "../services/password-reset.server";
import type { Route } from "./+types/reset-password";

export function meta() {
	return [{ title: "Set New Password - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (!token) {
		return { valid: false, error: "Missing token" };
	}

	const validation = await passwordResetService.validateResetToken(token);
	// Be careful not to expose sensitive info, but here we just need validity.
	return { valid: validation.valid, error: validation.error, token };
}

export default function ResetPassword({ loaderData }: Route.ComponentProps) {
	const { valid, error, token } = loaderData;
	const { Form: FetcherForm, data, state } = useFetcher();
	const isSubmitting = state === "submitting";
	const [password, setPassword] = useState("");

	// If token is invalid from basic checks
	if (!valid) {
		return (
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
				<div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-responsive text-center shadow-lg">
					<h2 className="heading-3 mb-2">Invalid or Expired Link</h2>
					<p className="mb-6 text-gray-600">
						{error || "This password reset link is invalid or has expired."}
					</p>
					<Link to="/forgot-password">
						<Button className="w-full">Request New Link</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-responsive py-responsive">
			<div className="stack-lg w-full max-w-md rounded-xl border border-gray-100 bg-white p-responsive shadow-lg">
				<div className="text-center">
					<h2 className="heading-2 mt-2">Set new password</h2>
					<p className="caption mt-2">Please enter your new password below.</p>
				</div>

				{data?.success ? (
					<div className="rounded-md border border-accent-200 bg-accent-50 p-4 text-center">
						<h3 className="mb-2 font-medium text-accent-800">
							Password Reset Successful
						</h3>
						<p className="text-accent-600 text-sm">
							Your password has been updated. You can now log in with your new
							password.
						</p>
						<Link to="/login" className="mt-4 block">
							<Button className="w-full">Log In Now</Button>
						</Link>
					</div>
				) : (
					<FetcherForm
						action="/api/auth/reset-password"
						method="post"
						className="stack-md mt-8"
					>
						<input type="hidden" name="token" value={token} />

						{data?.error && (
							<div className="rounded-md border border-red-100 bg-red-50 p-3 text-red-600 text-sm">
								{data.error}
							</div>
						)}

						<div className="stack">
							<div>
								<Input
									id="password"
									name="password"
									type="password"
									label="New Password"
									autoComplete="new-password"
									required
									className="h-11"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<PasswordStrengthIndicator password={password} />
							</div>
							{/* Could add confirm password for UX, but spec FR-005 strictly lists strength requirements */}
						</div>

						<Button
							type="submit"
							className="h-11 w-full text-base"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Resetting..." : "Reset Password"}
						</Button>
					</FetcherForm>
				)}
			</div>
		</div>
	);
}
