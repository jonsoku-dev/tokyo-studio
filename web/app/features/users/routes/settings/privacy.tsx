import { db } from "@itcom/db/client";
import { profilePrivacySettings } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { useFetcher } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import type { Route } from "./+types/privacy";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	const settings = await db.query.profilePrivacySettings.findFirst({
		where: eq(profilePrivacySettings.userId, userId),
	});

	// Default settings if not found
	return {
		settings: settings || {
			hideEmail: true,
			hideFullName: false,
			hideActivity: false,
		},
	};
}

export default function PrivacySettings({ loaderData }: Route.ComponentProps) {
	const { settings } = loaderData;
	const fetcher = useFetcher();
	const isSaving = fetcher.state === "submitting";

	return (
		<div>
			<PageHeader title="Privacy Settings" className="mb-6" />

			<div className="overflow-hidden rounded-lg bg-white shadow">
				<div className="stack-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-medium text-gray-900 text-lg leading-6">
								Public Profile Visibility
							</h3>
							<p className="caption mt-1">
								Control what information is visible to other users.
							</p>
						</div>
					</div>

					<fetcher.Form
						method="post"
						action="/api/users/me/privacy"
						className="stack-md"
					>
						<div className="stack">
							<div className="flex items-start">
								<div className="flex h-5 items-center">
									<input
										id="hideEmail"
										name="hideEmail"
										type="checkbox"
										value="true"
										defaultChecked={settings.hideEmail}
										className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="hideEmail"
										className="font-medium text-gray-700"
									>
										Hide Email Address
									</label>
									<p className="text-gray-500">
										Only show your email to people you explicitly connect with.
									</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex h-5 items-center">
									<input
										id="hideFullName"
										name="hideFullName"
										type="checkbox"
										value="true"
										defaultChecked={settings.hideFullName}
										className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="hideFullName"
										className="font-medium text-gray-700"
									>
										Hide Full Name (Show Username only)
									</label>
									<p className="text-gray-500">
										Your public profile will use your username/slug instead of
										your real name.
									</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex h-5 items-center">
									<input
										id="hideActivity"
										name="hideActivity"
										type="checkbox"
										value="true"
										defaultChecked={settings.hideActivity}
										className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="hideActivity"
										className="font-medium text-gray-700"
									>
										Hide Activity History
									</label>
									<p className="text-gray-500">
										Do not display badges, sessions attended, or post counts on
										your profile.
									</p>
								</div>
							</div>
						</div>

						<div className="flex justify-end">
							<Button type="submit" disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Privacy Settings"}
							</Button>
						</div>
					</fetcher.Form>
				</div>
			</div>
		</div>
	);
}
