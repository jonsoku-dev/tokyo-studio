import { Form, Link } from "react-router";
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
		return createUserSession(response.user.id, "/roadmap");
	} catch (error) {
		return { error: (error as Error).message };
	}
}

export default function Signup({ actionData }: Route.ComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center px-responsive py-responsive">
			<div className="stack-lg w-full max-w-md rounded-xl border border-gray-100 bg-white p-responsive shadow-lg">
				<div className="mb-6 text-center">
					<h1 className="heading-3">Create an account</h1>
					<p className="body-sm mt-2">
						Already have an account?{" "}
						<Link to="/login" className="link">
							Sign in
						</Link>
					</p>
				</div>

				<Form method="post" className="stack-md">
					{actionData?.error && (
						<div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
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
		</div>
	);
}
