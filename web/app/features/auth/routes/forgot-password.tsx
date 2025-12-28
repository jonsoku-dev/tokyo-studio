import { Link, useFetcher } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import type { Route } from "./+types/forgot-password";

export function meta() {
	return [{ title: "Forgot Password - Japan IT Job" }];
}

export function action({ request }: Route.ActionArgs) {
	return null;
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
	const { Form: FetcherForm, data, state } = useFetcher();
	const isApiSubmitting = state === "submitting";

	return (
		<Shell>
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
					<div className="text-center">
						<h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
							Reset your password
						</h2>
						<p className="mt-2 text-sm text-gray-500">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>

					{data?.success ? (
						<div className="bg-green-50 p-4 rounded-md border border-green-200 text-center">
							<h3 className="text-green-800 font-medium mb-2">
								Check your email
							</h3>
							<p className="text-green-600 text-sm">
								We've sent a password reset link to your email address.
							</p>
							<Link
								to="/login"
								className="block mt-4 text-orange-600 hover:text-orange-500 font-medium text-sm"
							>
								Back to Login
							</Link>
						</div>
					) : (
						<FetcherForm
							action="/api/auth/forgot-password"
							method="post"
							className="mt-8 space-y-6"
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

							<p className="text-center text-sm text-gray-600">
								Remember your password?{" "}
								<Link
									to="/login"
									className="font-medium text-orange-600 hover:text-orange-500"
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
