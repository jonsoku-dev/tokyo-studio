import { Link, useFetcher } from "react-router";

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
		<div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-responsive py-responsive">
			<div className="stack-lg w-full max-w-md rounded-xl border border-gray-100 bg-white p-responsive shadow-lg">
				<div className="text-center">
					<h2 className="heading-2 mt-2">Reset your password</h2>
					<p className="caption mt-2">
						Enter your email address and we'll send you a link to reset your
						password.
					</p>
				</div>

				{data?.success ? (
					<div className="rounded-md border border-accent-200 bg-accent-50 p-4 text-center">
						<h3 className="mb-2 font-medium text-accent-800">
							Check your email
						</h3>
						<p className="text-accent-600 text-sm">
							We've sent a password reset link to your email address.
						</p>
						<Link to="/login" className="link mt-4 block font-medium text-sm">
							Back to Login
						</Link>
					</div>
				) : (
					<FetcherForm
						action="/api/auth/forgot-password"
						method="post"
						className="stack-md mt-8"
					>
						{data?.error && (
							<div className="rounded-md border border-red-100 bg-red-50 p-3 text-red-600 text-sm">
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
							className="h-11 w-full text-base"
							disabled={isApiSubmitting}
						>
							{isApiSubmitting ? "Sending..." : "Send Reset Link"}
						</Button>

						<p className="body-sm text-center">
							Remember your password?{" "}
							<Link to="/login" className="link">
								Log in
							</Link>
						</p>
					</FetcherForm>
				)}
			</div>
		</div>
	);
}
