import { eq } from "drizzle-orm";
import { Form, useLoaderData, useNavigation } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { db } from "@itcom/db/client";
import { mentorProfiles } from "@itcom/db/schema";
import type { Route } from "./+types/mentoring.settings";

export function meta() {
	return [{ title: "Mentor Settings - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);

	const profile = await db.query.mentorProfiles.findFirst({
		where: eq(mentorProfiles.userId, userId),
	});

	if (!profile) {
		// In a real app, redirect to "Become a Mentor" flow
		throw new Response("Mentor profile not found", { status: 404 });
	}

	return { profile };
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const preferredVideoProvider = formData.get(
		"preferredVideoProvider",
	) as string;
	const manualMeetingUrl = formData.get("manualMeetingUrl") as string;
	const hourlyRate = formData.get("hourlyRate");

	await db
		.update(mentorProfiles)
		.set({
			preferredVideoProvider: preferredVideoProvider as
				| "jitsi"
				| "google"
				| "zoom"
				| "manual",
			manualMeetingUrl: manualMeetingUrl,
			// Allow updating rate too as a bonus
			hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
			updatedAt: new Date(),
		})
		.where(eq(mentorProfiles.userId, userId));

	return { success: true };
}

export default function MentorSettings() {
	const { profile } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const isSaving = navigation.state === "submitting";

	return (
		<Shell>
			<div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="space-y-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Mentor Settings
						</h1>
						<p className="mt-1 text-sm text-gray-500">
							Configure your mentoring preferences and video conferencing.
						</p>
					</div>

					<div className="bg-white shadow rounded-lg p-6">
						<Form method="post" className="space-y-6">
							<div>
								<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
									Video Conferencing
								</h3>

								<div className="space-y-4">
									<div>
										<label
											htmlFor="preferredVideoProvider"
											className="block text-sm font-medium text-gray-700"
										>
											Preferred Provider
										</label>
										<select
											id="preferredVideoProvider"
											name="preferredVideoProvider"
											defaultValue={profile.preferredVideoProvider || "jitsi"}
											className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
										>
											<option value="jitsi">
												Jitsi Meet (Automatic, Free)
											</option>
											<option value="google">Google Meet (Coming Soon)</option>
											<option value="zoom">Zoom (Coming Soon)</option>
											<option value="manual">Manual URL</option>
										</select>
										<p className="mt-1 text-xs text-gray-500">
											"Manual" allows you to paste a permanent link (e.g., your
											personal Zoom room).
										</p>
									</div>

									<div>
										<Input
											label="Manual Meeting URL"
											name="manualMeetingUrl"
											placeholder="https://zoom.us/j/123456789"
											defaultValue={profile.manualMeetingUrl || ""}
										/>
										<p className="mt-1 text-xs text-gray-500">
											Only used if "Manual URL" is selected above.
										</p>
									</div>
								</div>
							</div>

							<div className="border-t border-gray-200 pt-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
									Session Details
								</h3>
								<div className="space-y-4">
									<Input
										label="Hourly Rate ($)"
										name="hourlyRate"
										type="number"
										min="0"
										defaultValue={profile.hourlyRate || 0}
									/>
								</div>
							</div>

							<div className="flex justify-end pt-4">
								<Button type="submit" disabled={isSaving}>
									{isSaving ? "Saving..." : "Save Configuration"}
								</Button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</Shell>
	);
}
