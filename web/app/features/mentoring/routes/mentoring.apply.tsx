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
import { storageService } from "~/shared/services/storage.server";
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
		const entries = str.split(",").map((s) => s.trim()).filter(Boolean);
		return entries.reduce((acc, entry) => {
			const [lang, level] = entry.includes(":") ? entry.split(":") : [entry, "Conversational"];
			acc[lang.trim()] = (level || "Conversational").trim();
			return acc;
		}, {} as Record<string, string>);
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
		return data({ error: "Verification document upload is temporarily unavailable." });
	}

	// Validate Text Fields
	const rawData = Object.fromEntries(formData);
	const result = applicationSchema.safeParse(rawData);

	if (!result.success) {
		return data({ error: "Invalid form data", details: result.error.flatten() });
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
		<div className="container mx-auto max-w-2xl py-12 px-4">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
				<p className="text-gray-400">
					Share your expertise and help others grow in their IT career in Japan.
				</p>
			</div>

			<div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 shadow-xl">
				{actionData?.error && (
					<div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
						<p className="font-bold">Error</p>
						<p>{actionData.error}</p>
					</div>
				)}

				<Form method="post" encType="multipart/form-data" className="space-y-6">
					{/* Professional Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Job Title
							</label>
							<input
								name="jobTitle"
								type="text"
								required
								className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="e.g. Senior Frontend Engineer"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Company
							</label>
							<input
								name="company"
								type="text"
								required
								className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="e.g. Tech Corp KK"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Years of Experience
							</label>
							<input
								name="yearsOfExperience"
								type="number"
								min="0"
								required
								className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								LinkedIn URL (Optional)
							</label>
							<input
								name="linkedinUrl"
								type="url"
								className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
								placeholder="https://linkedin.com/in/..."
							/>
						</div>
					</div>

					{/* JSON Fields (Simple Input for MVP) */}
					<div>
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Expertise (Comma separated)
						</label>
						<input
							name="expertise"
							type="text"
							required
							className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Frontend, React, TypeScript, Career Advice"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Languages Spoken (Comma separated)
						</label>
						<input
							name="languages"
							type="text"
							required
							className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Korean, Japanese (Business), English"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Bio / Motivation
						</label>
						<textarea
							name="bio"
							rows={4}
							required
							className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-white focus:border-primary focus:outline-none"
							placeholder="Tell us about yourself and why you want to mentor..."
						/>
					</div>

					{/* File Upload */}
					<div className="p-4 rounded-lg border border-dashed border-white/20 bg-white/5">
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Verification Document
						</label>
						<p className="text-xs text-gray-500 mb-4">
							Please upload a company ID or payslip. This file will be stored
							securely and only visible to admins.
						</p>
						<input
							name="verificationFile"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							required
							className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
						/>
					</div>

					<div className="pt-4 flex justify-end gap-3">
						<Link
							to="/dashboard"
							className="px-6 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
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
