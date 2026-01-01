import { Link, useFetcher } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import type { Route } from "./+types/forgot-password";

export function meta() {
	return [{ title: "Forgot Password - Japan IT Job" }];
}

export function action(_args: Route.ActionArgs) {
	return null;
}

export default function ForgotPassword(_props: Route.ComponentProps) {
	const { Form: FetcherForm, data, state } = useFetcher();
	const isApiSubmitting = state === "submitting";

	return (
		<Shell>
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md stack-lg bg-white p-8 rounded-xl shadow-lg border border-gray-100">
					<div className="text-center">
						<h2 className="mt-2 heading-2">Reset your password</h2>
						<p className="mt-2 caption">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>

					{data?.success ? (
						<div className="bg-accent-50 p-4 rounded-md border border-accent-200 text-center">
							<h3 className="text-accent-800 font-medium mb-2">
								Check your email
							</h3>
							<p className="text-accent-600 text-sm">
								We've sent a password reset link to your email address.
							</p>
							<Link
								to="/login"
								className="block mt-4 link font-medium text-sm"
							>
								Back to Login
							</Link>
						</div>
					) : (
						<FetcherForm
							action="/api/auth/forgot-password"
							method="post"
							className="mt-8 stack-md"
						>
							{data?.error && (
								<div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
									{data.error}
								</div>
							)}

							<div>
								<Input
									id="email"
									name="email"
									type="email"
									label="Email address"
									autoComplete="email"
									required
									className="h-11"
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-11 text-base"
								disabled={isApiSubmitting}
							>
								{isApiSubmitting ? "Sending..." : "Send Reset Link"}
							</Button>

							<p className="text-center body-sm">
								Remember your password?{" "}
								<Link
									to="/login"
									className="link"
								>
									Log in
								</Link>
							</p>
						</FetcherForm>
					)}
				</div>
			</div>
		</Shell>
	);
}
