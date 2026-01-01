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
import { Button } from "~/shared/components/ui/Button";
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
		<div className="container-page max-w-2xl px-4 py-12">
			<div className="mb-8 text-center">
				<h1 className="heading-2 mb-2">Become a Mentor</h1>
				<p className="text-gray-400">
					Share your expertise and help others grow in their IT career in Japan.
				</p>
			</div>

			<div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 shadow-xl">
				{actionData?.error && (
					<div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
						<p className="font-bold">Error</p>
						<p>{actionData.error}</p>
					</div>
				)}

				<Form method="post" encType="multipart/form-data" className="stack-md">
					{/* Professional Info */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label
								htmlFor="jobTitle"
								className="mb-2 block font-medium text-gray-400 text-sm"
							>
								Job Title
							</label>
							<input
								id="jobTitle"
								name="jobTitle"
								type="text"
								required
								className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="e.g. Senior Frontend Engineer"
							/>
						</div>
						<div>
							<label
								htmlFor="company"
								className="mb-2 block font-medium text-gray-400 text-sm"
							>
								Company
							</label>
							<input
								id="company"
								name="company"
								type="text"
								required
								className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="e.g. Tech Corp KK"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label
								htmlFor="yearsOfExperience"
								className="mb-2 block font-medium text-gray-400 text-sm"
							>
								Years of Experience
							</label>
							<input
								id="yearsOfExperience"
								name="yearsOfExperience"
								type="number"
								min="0"
								required
								className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="linkedinUrl"
								className="mb-2 block font-medium text-gray-400 text-sm"
							>
								LinkedIn URL (Optional)
							</label>
							<input
								id="linkedinUrl"
								name="linkedinUrl"
								type="url"
								className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="https://linkedin.com/in/..."
							/>
						</div>
					</div>

					{/* JSON Fields (Simple Input for MVP) */}
					<div>
						<label
							htmlFor="expertise"
							className="mb-2 block font-medium text-gray-400 text-sm"
						>
							Expertise (Comma separated)
						</label>
						<input
							id="expertise"
							name="expertise"
							type="text"
							required
							className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Frontend, React, TypeScript, Career Advice"
						/>
					</div>

					<div>
						<label
							htmlFor="languages"
							className="mb-2 block font-medium text-gray-400 text-sm"
						>
							Languages Spoken (Comma separated)
						</label>
						<input
							id="languages"
							name="languages"
							type="text"
							required
							className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Korean, Japanese (Business), English"
						/>
					</div>

					<div>
						<label
							htmlFor="bio"
							className="mb-2 block font-medium text-gray-400 text-sm"
						>
							Bio / Motivation
						</label>
						<textarea
							id="bio"
							name="bio"
							rows={4}
							required
							className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Tell us about yourself and why you want to mentor..."
						/>
					</div>

					{/* File Upload */}
					<div className="rounded-lg border border-white/20 border-dashed bg-white/5 p-4">
						<label
							htmlFor="verificationFile"
							className="mb-2 block font-medium text-gray-400 text-sm"
						>
							Verification Document
						</label>
						<p className="caption mb-4">
							Please upload a company ID or payslip. This file will be stored
							securely and only visible to admins.
						</p>
						<input
							id="verificationFile"
							name="verificationFile"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							required
							className="w-full text-gray-400 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-sm file:text-white hover:file:bg-primary/80"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Link
							to="/dashboard"
							className="rounded-lg px-6 py-2 text-gray-400 transition-colors hover:text-white"
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
