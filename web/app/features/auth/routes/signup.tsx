import { Form, Link, useActionData } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { authService } from "../domain/auth.service.server";
import { SignupSchema } from "../domain/auth.types";
import { createUserSession } from "../utils/session.server";
import type { Route } from "./+types/signup";

export function meta() {
	return [{ title: "Sign Up - Japan IT Job" }];
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = String(formData.get("email"));
	const password = String(formData.get("password"));
	const name = String(formData.get("name"));

	const result = SignupSchema.safeParse({ email, password, name });

	if (!result.success) {
		return { error: result.error.issues[0].message };
	}

	try {
		const response = await authService.signup(result.data);
		return createUserSession(response.user.id, "/");
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export default function Signup({ actionData }: Route.ComponentProps) {
	return (
		<Shell>
			<div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-gray-900">
						Create an account
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-orange-600 hover:text-orange-500"
						>
							Sign in
						</Link>
					</p>
				</div>

				<Form method="post" className="space-y-6">
					{actionData?.error && (
						<div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
							{actionData.error}
						</div>
					)}

					<Input
						id="name"
						name="name"
						type="text"
						label="Full Name"
						autoComplete="name"
						required
					/>

					<Input
						id="email"
						name="email"
						type="email"
						label="Email address"
						autoComplete="email"
						required
					/>

					<Input
						id="password"
						name="password"
						type="password"
						label="Password"
						autoComplete="new-password"
						required
					/>

					<Button type="submit" className="w-full">
						Sign up
					</Button>
				</Form>
			</div>
		</Shell>
	);
}
