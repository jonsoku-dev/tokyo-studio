import { db } from "@itcom/db/client";
import { profilePrivacySettings } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { useFetcher } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Shell } from "~/shared/components/layout/Shell";
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
		<Shell>
			<div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					Privacy Settings
				</h1>

				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="p-6 space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									Public Profile Visibility
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Control what information is visible to other users.
								</p>
							</div>
						</div>

						<fetcher.Form
							method="post"
							action="/api/users/me/privacy"
							className="space-y-6"
						>
							<div className="space-y-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="hideEmail"
											name="hideEmail"
											type="checkbox"
											value="true"
											defaultChecked={settings.hideEmail}
											className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
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
											Only show your email to people you explicitly connect
											with.
										</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="hideFullName"
											name="hideFullName"
											type="checkbox"
											value="true"
											defaultChecked={settings.hideFullName}
											className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
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
									<div className="flex items-center h-5">
										<input
											id="hideActivity"
											name="hideActivity"
											type="checkbox"
											value="true"
											defaultChecked={settings.hideActivity}
											className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
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
											Do not display badges, sessions attended, or post counts
											on your profile.
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
		</Shell>
	);
}
