import { db } from "@itcom/db/client";
import { users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import {
	type ActionFunctionArgs,
	data,
	Form,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
// Note: File upload via unstable_parseMultipartFormData is disabled
// These imports are not yet stable in React Router v7
import { z } from "zod";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { Textarea } from "~/shared/components/ui/Textarea";
import { applicationService } from "../services/application.server";

// Zod Schema for validation (Client & Server)
const applicationSchema = z.object({
	jobTitle: z.string().min(2, "Job title is required"),
	company: z.string().min(2, "Company is required"),
	yearsOfExperience: z.coerce.number().min(0).max(50),
	linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
	bio: z.string().min(20, "Bio must be at least 20 characters"),
	expertise: z.string().transform((str) =>
		str
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
	),
	languages: z.string().transform((str) => {
		// Convert comma-separated "language:level" pairs to Record
		const entries = str
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		return entries.reduce(
			(acc, entry) => {
				const [lang, level] = entry.includes(":")
					? entry.split(":")
					: [entry, "Conversational"];
				acc[lang.trim()] = (level || "Conversational").trim();
				return acc;
			},
			{} as Record<string, string>,
		);
	}),
	// verificationFile handled separately
});

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);

	// Check existing application
	const status = await applicationService.getApplicationStatus(userId);

	// Get user info for pre-filling (optional)
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (status) {
		// If pending or approved, redirect or show status page?
		// Spec says: "show status on dashboard".
		// But if they visit /apply, maybe show "You have a pending application" or redirect to dashboard.
		// Let's redirect to dashboard if pending/approved.
		if (
			status.status === "pending" ||
			status.status === "approved" ||
			status.status === "under_review"
		) {
			return redirect("/dashboard");
		}
		// If rejected, allow re-apply if cool-down passed (implement later).
	}

	return { user };
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);

	// Note: File upload via unstable_parseMultipartFormData is currently disabled
	// due to import issues. Using simple formData for now - file upload needs server setup.
	const formData = await request.formData();

	const verificationFileUrl = formData.get("verificationFile") as string;
	if (!verificationFileUrl) {
		return data({
			error: "Verification document upload is temporarily unavailable.",
		});
	}

	// Validate Text Fields
	const rawData = Object.fromEntries(formData);
	const result = applicationSchema.safeParse(rawData);

	if (!result.success) {
		return data({
			error: "Invalid form data",
			details: result.error.flatten(),
		});
	}

	try {
		await applicationService.createApplication({
			userId,
			...result.data,
			verificationFileUrl: verificationFileUrl.toString(),
			status: "pending",
		});
		return redirect("/dashboard");
	} catch (error) {
		console.error(error);
		return data({ error: "Failed to submit application." });
	}
}

export default function MentorApplicationPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div>
			<PageHeader
				title="Become a Mentor"
				description="Share your expertise and help others grow in their IT career in Japan."
				className="mb-8"
			/>

			<div className="card-lg bg-white shadow-xl">
				{actionData?.error && (
					<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-responsive text-red-700">
						<p className="font-bold">Error</p>
						<p>{actionData.error}</p>
					</div>
				)}

				<Form method="post" encType="multipart/form-data" className="stack-md">
					{/* Professional Info */}
					<div className="grid grid-cols-1 gap-responsive md:grid-cols-2">
						<Input
							label="Job Title"
							id="jobTitle"
							name="jobTitle"
							required
							placeholder="e.g. Senior Frontend Engineer"
						/>
						<Input
							label="Company"
							id="company"
							name="company"
							required
							placeholder="e.g. Tech Corp KK"
						/>
					</div>

					<div className="grid grid-cols-1 gap-responsive md:grid-cols-2">
						<Input
							label="Years of Experience"
							id="yearsOfExperience"
							name="yearsOfExperience"
							type="number"
							min="0"
							required
						/>
						<Input
							label="LinkedIn URL (Optional)"
							id="linkedinUrl"
							name="linkedinUrl"
							type="url"
							placeholder="https://linkedin.com/in/..."
						/>
					</div>

					{/* JSON Fields (Simple Input for MVP) */}
					<Input
						label="Expertise (Comma separated)"
						id="expertise"
						name="expertise"
						required
						placeholder="Frontend, React, TypeScript, Career Advice"
					/>

					<Input
						label="Languages Spoken (Comma separated)"
						id="languages"
						name="languages"
						required
						placeholder="Korean, Japanese (Business), English"
					/>

					<div>
						<label
							htmlFor="bio"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Bio / Motivation
						</label>
						<Textarea
							id="bio"
							name="bio"
							rows={4}
							required
							placeholder="Tell us about yourself and why you want to mentor..."
						/>
					</div>

					{/* File Upload */}
					<div className="rounded-lg border border-gray-300 border-dashed bg-gray-50 p-responsive text-center">
						<label
							htmlFor="verificationFile"
							className="mb-2 block font-medium text-gray-900 text-sm"
						>
							Verification Document
						</label>
						<p className="caption mb-4 text-gray-500">
							Please upload a company ID or payslip. This file will be stored
							securely and only visible to admins.
						</p>
						<input
							id="verificationFile"
							name="verificationFile"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							required
							className="mx-auto block w-full max-w-xs text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:font-semibold file:text-primary-700 file:text-sm hover:file:bg-primary-100"
						/>
					</div>

					<div className="flex justify-end gap-3 border-gray-100 border-t pt-6">
						<Link
							to="/dashboard"
							className="rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100"
						>
							Cancel
						</Link>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Submitting..." : "Submit Application"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
