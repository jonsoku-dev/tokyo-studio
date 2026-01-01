import { db } from "@itcom/db/client";
import { profiles, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { useState } from "react";
import { Link, redirect, useFetcher } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import type { DocumentOption } from "~/features/documents/components/DocumentSelector";
import { DocumentSelector } from "~/features/documents/components/DocumentSelector";
import { PORTFOLIO_DOCUMENT_TYPES } from "~/features/documents/constants";
import { documentsService } from "~/features/documents/services/documents.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";

import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { AvatarUpload } from "../components/AvatarUpload";
import type { Route } from "./+types/profile";

export function meta() {
	return [{ title: "Profile Settings - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const [user] = await db.select().from(users).where(eq(users.id, userId));

	if (!user) {
		throw redirect("/login");
	}

	const [profile, portfolioDocuments] = await Promise.all([
		db.query.profiles.findFirst({
			where: eq(profiles.userId, userId),
		}),
		// SPEC 022: Fetch portfolio documents for selection
		documentsService.getUserDocumentsByType(userId, [
			...PORTFOLIO_DOCUMENT_TYPES,
		]),
	]);

	return { user, profile, portfolioDocuments };
}

export default function ProfileSettings({ loaderData }: Route.ComponentProps) {
	const { user, profile, portfolioDocuments } = loaderData;
	const fetcher = useFetcher();
	const isSaving = fetcher.state === "submitting";

	// SPEC 022: Portfolio document state
	const [portfolioDocumentId, setPortfolioDocumentId] = useState<string | null>(
		profile?.portfolioDocumentId ?? null,
	);

	return (
		<div>
			<PageHeader
				title="Profile Settings"
				description="Update your photo and personal details."
				className="mb-8"
			/>

			<div className="space-y-6">
				{/* Profile Picture Section */}
				<div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
					<div className="p-6">
						<h3 className="text-base font-semibold leading-7 text-gray-900">
							Profile Picture
						</h3>
						<div className="mt-6">
							<AvatarUpload
								currentAvatarUrl={user.avatarUrl}
								userName={user.name || user.email}
							/>
						</div>
					</div>
				</div>

				{/* Public Profile Info Section */}
				<div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
					<div className="p-6">
						<h3 className="text-base font-semibold leading-7 text-gray-900">
							Public Profile Info
						</h3>

						<fetcher.Form
							method="post"
							action="/api/users/me/profile"
							className="mt-6 space-y-6"
						>
							{fetcher.data?.error && (
								<div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
									{fetcher.data.error}
								</div>
							)}
							{fetcher.data?.success && (
								<div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
									Profile updated successfully!
								</div>
							)}

							<div>
								<label
									htmlFor="bio"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Bio
								</label>
								<div className="mt-2">
									<textarea
										id="bio"
										name="bio"
										rows={4}
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
										defaultValue={profile?.bio || ""}
										placeholder="Tell us about yourself..."
									/>
								</div>
							</div>

							<div className="space-y-1">
								<Input
									label="Custom URL Slug"
									name="slug"
									placeholder="john-doe"
									defaultValue={profile?.slug || ""}
								/>
								<p className="text-xs text-gray-500">
									Your profile will be at /profile/your-slug
								</p>
							</div>

							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<Input
									label="Website"
									name="website"
									placeholder="https://example.com"
									defaultValue={profile?.website || ""}
								/>
								<Input
									label="LinkedIn URL"
									name="linkedinUrl"
									placeholder="https://linkedin.com/in/..."
									defaultValue={profile?.linkedinUrl || ""}
								/>
								<Input
									label="GitHub URL"
									name="githubUrl"
									placeholder="https://github.com/..."
									defaultValue={profile?.githubUrl || ""}
								/>
							</div>

							{/* SPEC 022: Portfolio Document Selection */}
							{portfolioDocuments.length > 0 && (
								<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
									<DocumentSelector
										documents={portfolioDocuments as DocumentOption[]}
										selectedId={portfolioDocumentId}
										mode="single"
										onChange={(selected) =>
											setPortfolioDocumentId(selected as string | null)
										}
										label="Portfolio Document"
										placeholder="Select a portfolio to showcase..."
										hint="This will be displayed on your public profile"
									/>
									<input
										type="hidden"
										name="portfolioDocumentId"
										value={portfolioDocumentId || ""}
									/>
								</div>
							)}

							<div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-4">
								{profile?.slug && (
									<Link
										to={`/profile/${profile.slug}`}
										target="_blank"
										className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
									>
										View Public Profile
									</Link>
								)}
								<Button type="submit" disabled={isSaving}>
									{isSaving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</fetcher.Form>
					</div>
				</div>

				{/* Account Information Section */}
				<div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
					<div className="p-6">
						<h3 className="text-base font-semibold leading-7 text-gray-900">
							Account Information
						</h3>
						<dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Full name</dt>
								<dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
							</div>
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">
									Email address
								</dt>
								<dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
							</div>
							<div className="sm:col-span-2 space-y-2">
								<div>
									<Link
										to="/settings/privacy"
										className="text-sm font-medium text-primary-600 hover:text-primary-500"
									>
										Manage Privacy Settings &rarr;
									</Link>
								</div>
								<div>
									<Link
										to="/mentoring/settings"
										className="text-sm font-medium text-primary-600 hover:text-primary-500"
									>
										Manage Mentor Settings &rarr;
									</Link>
								</div>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}
