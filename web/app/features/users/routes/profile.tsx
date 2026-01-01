import { db } from "@itcom/db/client";
import { profiles, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Link, redirect, useFetcher } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Shell } from "~/shared/components/layout/Shell";
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
		<Shell>
			<div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="stack-md">
					<div>
						<h1 className="heading-3">
							Profile Settings
						</h1>
						<p className="mt-1 caption">
							Update your photo and personal details.
						</p>
					</div>

					<div className="bg-white shadow rounded-lg p-6 stack-lg">
						<div>
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Profile Picture
							</h3>
							<AvatarUpload
								currentAvatarUrl={user.avatarUrl}
								userName={user.name || user.email}
							/>
						</div>

						<div className="divider pt-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Public Profile Info
							</h3>

							<fetcher.Form
								method="post"
								action="/api/users/me/profile"
								className="stack-md"
							>
								{fetcher.data?.error && (
									<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
										{fetcher.data.error}
									</div>
								)}
								{fetcher.data?.success && (
									<div className="bg-accent-50 text-accent-600 p-3 rounded-md text-sm">
										Profile updated successfully!
									</div>
								)}

								<div>
									<label
										htmlFor="bio"
										className="block text-sm font-medium text-gray-700"
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
											className="inline-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Account Information
							</h3>
							<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
								<div className="sm:col-span-1">
									<dt className="text-sm font-medium text-gray-500">
										Full name
									</dt>
									<dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
								</div>
								<div className="sm:col-span-1">
									<dt className="text-sm font-medium text-gray-500">
										Email address
									</dt>
									<dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
								</div>
								<div className="sm:col-span-2">
									<Link
										to="/settings/privacy"
										className="text-sm link"
									>
										Manage Privacy Settings &rarr;
									</Link>
								</div>
								<div className="sm:col-span-2">
									<Link
										to="/mentoring/settings"
										className="text-sm link"
									>
										Manage Mentor Settings &rarr;
									</Link>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</Shell>
	);
}
