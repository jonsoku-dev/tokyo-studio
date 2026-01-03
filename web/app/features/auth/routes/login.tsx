import { Form, Link } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { authService } from "../domain/auth.service.server";
import { LoginSchema } from "../domain/auth.types";
import { createUserSession } from "../utils/session.server";
import type { Route } from "./+types/login";

export function meta() {
	return [{ title: "Login - Japan IT Job" }];
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = String(formData.get("email"));
	const password = String(formData.get("password"));
	const redirectTo = String(formData.get("redirectTo") || "/");

	const result = LoginSchema.safeParse({ email, password });

	if (!result.success) {
		return { error: result.error.issues[0].message };
	}

	try {
		const response = await authService.login(result.data);
		return createUserSession(response.user.id, redirectTo);
	} catch (_error) {
		return { error: "Invalid email or password" };
	}
}

export default function Login({ actionData }: Route.ComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center px-responsive py-responsive">
			<div className="stack-lg w-full max-w-md rounded-xl border border-gray-100 bg-white p-responsive shadow-lg">
				<div className="text-center">
					<h2 className="heading-2 mt-2">Welcome back</h2>
					<p className="caption mt-2">Sign in to continue your journey</p>
				</div>

				{/* Social Login Grid */}
				<div className="stack mt-8">
					<div className="grid grid-cols-2 gap-3">
						<Form action="/api/auth/google" method="post">
							<Button
								variant="outline"
								type="submit"
								className="center h-11 w-full gap-2 border-gray-300 transition-colors hover:bg-gray-50"
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<title>Google</title>
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								<span className="font-medium text-gray-700">Google</span>
							</Button>
						</Form>

						<Form action="/api/auth/github" method="post">
							<Button
								type="submit"
								className="center h-11 w-full gap-2 border-none bg-[#24292F] text-white transition-colors hover:bg-[#24292F]/90"
							>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>GitHub</title>
									<path
										fillRule="evenodd"
										d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="font-medium">GitHub</span>
							</Button>
						</Form>

						<Form action="/api/auth/kakao" method="post">
							<Button
								type="submit"
								className="center h-11 w-full gap-2 border-none bg-[#FEE500] text-[#191919] transition-colors hover:bg-[#FDD835]"
							>
								<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<title>Kakao</title>
									<path d="M12 3C6.48 3 2 6.48 2 10.76c0 2.82 1.94 5.3 4.88 6.64-.17.65-.63 2.37-.73 2.74-.11.43.16.42.33.31.22-.15 3.52-2.39 4.13-2.82.46.07.93.11 1.39.11 5.52 0 10-3.48 10-7.76S17.52 3 12 3z" />
								</svg>
								<span className="font-medium">Kakao</span>
							</Button>
						</Form>

						<Form action="/api/auth/line" method="post">
							<Button
								type="submit"
								className="center h-11 w-full gap-2 border-none bg-[#06C755] text-white transition-colors hover:bg-[#05b54c]"
							>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Line</title>
									<path d="M22.288 10.155c-.76-4.512-4.95-7.61-9.52-7.078C7.576 3.65 3.32 7.7 2.388 12.87c-.896 4.972 1.63 9.492 5.612 11.026.474.182.802.046.882-.572.036-.28.172-1.07.172-1.07.086-.48.016-.67-.282-1.01-3.23-3.69-2.583-8.835 1.558-11.832 4.095-2.964 9.473-.783 10.19 3.551.782 4.721-2.936 8.796-7.85 7.85-2.076-.4-4.223-2.126-4.223-2.126s.308.283.473.35c3.085 1.253 6.942-.898 7.697-4.267.896-3.996-1.577-7.674-5.322-8.156-4.814-.62-9.157 2.772-9.256 7.42-.083 3.93 2.502 6.635 2.502 6.635s-.273 1.64-.338 2.01c-.1.572-.46 2.035-.46 2.035s-.167.92.54 1.157c.706.236 4.54-2.506 5.488-3.328 4.29-2.73 6.398-7.397 2.44-12.435z" />
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M12 2C6.48 2 2 5.92 2 10.76C2 15.6 6.48 19.52 12 19.52C13.25 19.52 14.44 19.32 15.54 18.96C16.89 19.96 18.96 21.36 18.96 21.36C19.16 21.5 19.38 21.37 19.31 21.12C19.26 20.93 18.73 18.3 18.52 17.4C20.66 16.09 22 13.59 22 10.76C22 5.92 17.52 2 12 2ZM6.16 12.98H4.66C4.4 12.98 4.19 12.77 4.19 12.51V8.25C4.19 7.99 4.4 7.78 4.66 7.78C4.92 7.78 5.13 7.99 5.13 8.25V12.04H6.16C6.42 12.04 6.63 12.25 6.63 12.51C6.63 12.77 6.42 12.98 6.16 12.98ZM9.14 12.98H7.64C7.38 12.98 7.17 12.77 7.17 12.51V8.25C7.17 7.99 7.38 7.78 7.64 7.78C7.9 7.78 8.11 7.99 8.11 8.25V12.98H9.14C9.4 12.98 9.61 12.98 9.61 12.98ZM12.72 12.98H11.22C10.96 12.98 10.75 12.77 10.75 12.51V8.25C10.75 7.99 10.96 7.78 11.22 7.78H11.27C11.53 7.78 11.74 7.99 11.79 8.23L12.53 10.93L13.27 8.23C13.32 7.99 13.53 7.78 13.79 7.78H13.84C14.1 7.78 14.31 7.99 14.31 8.25V12.51C14.31 12.77 14.1 12.98 13.84 12.98C13.58 12.98 13.37 12.77 13.37 12.51V8.92L12.95 12.54C12.92 12.78 12.71 12.98 12.45 12.98H12.72ZM17.9 12.51C17.9 12.77 17.69 12.98 17.43 12.98H15.01C14.75 12.98 14.54 12.77 14.54 12.51V8.25C14.54 7.99 14.75 7.78 15.01 7.78H17.43C17.69 7.78 17.9 7.99 17.9 8.25C17.9 8.51 17.69 8.72 17.43 8.72H15.48V9.9H17.27C17.53 9.9 17.74 10.11 17.74 10.37C17.74 10.63 17.53 10.84 17.27 10.84H15.48V12.04H17.43C17.69 12.04 17.9 12.25 17.9 12.51Z"
									/>
								</svg>
								<span className="font-medium">Line</span>
							</Button>
						</Form>
					</div>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="divider w-full"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-gray-500">
								Or continue with
							</span>
						</div>
					</div>
				</div>

				<Form method="post" className="stack-md mt-8">
					{actionData?.error && (
						<div className="flex items-start gap-2 rounded-md border border-red-100 bg-red-50 p-3 text-red-600 text-sm">
							{/* Error Icon */}
							<svg
								className="h-5 w-5 flex-shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Error</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							{actionData.error}
						</div>
					)}

					<div className="stack">
						<Input
							id="email"
							name="email"
							type="email"
							label="Email address"
							autoComplete="email"
							required
							className="h-11"
						/>

						<div className="relative">
							<Input
								id="password"
								name="password"
								type="password"
								label="Password"
								autoComplete="current-password"
								required
								className="h-11"
							/>
							<div className="absolute top-0 right-0">
								<Link to="/forgot-password" className="link text-sm">
									Forgot?
								</Link>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						className="h-11 w-full text-base shadow-lg shadow-primary-100"
					>
						Sign in
					</Button>

					<p className="body-sm text-center">
						Don't have an account?{" "}
						<Link to="/signup" className="link">
							Sign up
						</Link>
					</p>
				</Form>
			</div>
		</div>
	);
}
