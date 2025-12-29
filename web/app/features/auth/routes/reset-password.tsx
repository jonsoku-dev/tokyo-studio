import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
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
			<Shell>
				<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4">
					<div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Invalid or Expired Link
						</h2>
						<p className="text-gray-600 mb-6">
							{error || "This password reset link is invalid or has expired."}
						</p>
						<Link to="/forgot-password">
							<Button className="w-full">Request New Link</Button>
						</Link>
					</div>
				</div>
			</Shell>
		);
	}

	return (
		<Shell>
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
					<div className="text-center">
						<h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
							Set new password
						</h2>
						<p className="mt-2 text-sm text-gray-500">
							Please enter your new password below.
						</p>
					</div>

					{data?.success ? (
						<div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
							<h3 className="text-green-800 font-medium mb-2">
								Password Reset Successful
							</h3>
							<p className="text-green-600 text-sm">
								Your password has been updated. You can now log in with your new
								password.
							</p>
							<Link to="/login" className="block mt-4">
								<Button className="w-full">Log In Now</Button>
							</Link>
						</div>
					) : (
						<FetcherForm
							action="/api/auth/reset-password"
							method="post"
							className="mt-8 space-y-6"
						>
							<input type="hidden" name="token" value={token} />

							{data?.error && (
								<div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
									{data.error}
								</div>
							)}

							<div className="space-y-4">
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
								className="w-full h-11 text-base"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Resetting..." : "Reset Password"}
							</Button>
						</FetcherForm>
					)}
				</div>
			</div>
		</Shell>
	);
}
