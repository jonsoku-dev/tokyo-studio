import { db } from "@itcom/db/client";
import { profiles, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Link, redirect, useFetcher } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";

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

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, userId),
	});

	return { user, profile };
}

export default function ProfileSettings({ loaderData }: Route.ComponentProps) {
	const { user, profile } = loaderData;
	const fetcher = useFetcher();
	const isSaving = fetcher.state === "submitting";

	return (
		<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="stack-md">
				<div>
					<h1 className="heading-3">Profile Settings</h1>
					<p className="caption mt-1">
						Update your photo and personal details.
					</p>
				</div>

				<div className="stack-lg rounded-lg bg-white p-6 shadow">
					<div>
						<h3 className="mb-4 font-medium text-gray-900 text-lg leading-6">
							Profile Picture
						</h3>
						<AvatarUpload
							currentAvatarUrl={user.avatarUrl}
							userName={user.name || user.email}
						/>
					</div>

					<div className="divider pt-6">
						<h3 className="mb-4 font-medium text-gray-900 text-lg leading-6">
							Public Profile Info
						</h3>

						<fetcher.Form
							method="post"
							action="/api/users/me/profile"
							className="stack-md"
						>
							{fetcher.data?.error && (
								<div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
									{fetcher.data.error}
								</div>
							)}
							{fetcher.data?.success && (
								<div className="rounded-md bg-accent-50 p-3 text-accent-600 text-sm">
									Profile updated successfully!
								</div>
							)}

							<div>
								<label
									htmlFor="bio"
									className="block font-medium text-gray-700 text-sm"
								>
									Bio
								</label>
								<div className="mt-1">
									<textarea
										id="bio"
										name="bio"
										rows={4}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
										defaultValue={profile?.bio || ""}
										placeholder="Tell us about yourself..."
									/>
								</div>
							</div>

							<div className="stack-xs">
								<Input
									label="Custom URL Slug"
									name="slug"
									placeholder="john-doe"
									defaultValue={profile?.slug || ""}
								/>
								<p className="caption">
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

							<div className="flex justify-end gap-3.5">
								{profile?.slug && (
									<Link
										to={`/profile/${profile.slug}`}
										target="_blank"
										className="inline-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

					<div className="divider pt-6">
						<h3 className="mb-4 font-medium text-gray-900 text-lg leading-6">
							Account Information
						</h3>
						<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
							<div className="sm:col-span-1">
								<dt className="font-medium text-gray-500 text-sm">Full name</dt>
								<dd className="mt-1 text-gray-900 text-sm">{user.name}</dd>
							</div>
							<div className="sm:col-span-1">
								<dt className="font-medium text-gray-500 text-sm">
									Email address
								</dt>
								<dd className="mt-1 text-gray-900 text-sm">{user.email}</dd>
							</div>
							<div className="sm:col-span-2">
								<Link to="/settings/privacy" className="link text-sm">
									Manage Privacy Settings &rarr;
								</Link>
							</div>
							<div className="sm:col-span-2">
								<Link to="/mentoring/settings" className="link text-sm">
									Manage Mentor Settings &rarr;
								</Link>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}
