import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { Shell } from "~/shared/components/layout/Shell";
import { db } from "~/shared/db/client.server";
import { users } from "~/shared/db/schema";
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

	return { user };
}

export default function ProfileSettings({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;

	return (
		<Shell>
			<div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="space-y-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Profile Settings
						</h1>
						<p className="mt-1 text-sm text-gray-500">
							Update your photo and personal details.
						</p>
					</div>

					<div className="bg-white shadow rounded-lg p-6 space-y-8">
						<div>
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Profile Picture
							</h3>
							<AvatarUpload
								currentAvatarUrl={user.avatarUrl}
								userName={user.name || user.email}
							/>
						</div>

						<div className="border-t border-gray-200 pt-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Personal Information
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
							</dl>
						</div>
					</div>
				</div>
			</div>
		</Shell>
	);
}
