import { Github, Globe, Languages, Linkedin, MapPin } from "lucide-react";
import { Shell } from "~/shared/components/layout/Shell";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/profile.$username";

export async function loader({ params }: Route.LoaderArgs) {
	const { username } = params;
	const profile = await profileService.getPublicProfile(username);

	if (!profile) {
		throw new Response("Profile not found", { status: 404 });
	}

	return { profile };
}

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [{ title: "Profile Not Found | Japan IT Job" }];
	const { profile } = data;
	const title = `${profile.user.name} | Japan IT Job`;
	const description =
		profile.bio || `Check out ${profile.user.name}'s profile on Japan IT Job.`;

	return [
		{ title },
		{ name: "description", content: description },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{
			property: "og:image",
			content: profile.user.avatarUrl || "/images/default-avatar.png",
		},
		{ name: "twitter:card", content: "summary_large_image" },
	];
}

export default function PublicProfile({ loaderData }: Route.ComponentProps) {
	const { profile } = loaderData;
	const { user } = profile;

	return (
		<Shell>
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					{/* Cover / Header */}
					<div className="h-32 bg-gradient-to-r from-orange-100 to-amber-100" />

					<div className="px-8 pb-8">
						<div className="relative flex justify-between items-end -mt-12 mb-6">
							<div className="relative">
								<div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm">
									{user.avatarUrl ? (
										<img
											src={user.avatarUrl}
											alt={user.name ?? "User"}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold">
											{(user.name ?? "User").slice(0, 2).toUpperCase()}
										</div>
									)}
								</div>
							</div>

							{/* Placeholder for "Connect" or "Book" button if implementing Mentor features */}
						</div>

						<div>
							<h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
							<p className="text-gray-500 font-medium">
								{profile.jobFamily} • {profile.level}
							</p>

							{profile.bio && (
								<p className="mt-4 text-gray-600 max-w-2xl whitespace-pre-wrap">
									{profile.bio}
								</p>
							)}

							<div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
								{profile.targetCity && (
									<div className="flex items-center gap-1.5">
										<MapPin className="w-4 h-4" />
										{profile.targetCity}
									</div>
								)}
								<div className="flex items-center gap-1.5">
									<Languages className="w-4 h-4" />
									<span>
										JP: {profile.jpLevel} • EN: {profile.enLevel}
									</span>
								</div>
								{profile.website && (
									<a
										href={profile.website}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
									>
										<Globe className="w-4 h-4" />
										Website
									</a>
								)}
								{profile.linkedinUrl && (
									<a
										href={profile.linkedinUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
									>
										<Linkedin className="w-4 h-4" />
										LinkedIn
									</a>
								)}
								{profile.githubUrl && (
									<a
										href={profile.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
									>
										<Github className="w-4 h-4" />
										GitHub
									</a>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Activity Section (Placeholder for now) */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 space-y-6">
						<section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>
							<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
								No public activity to show yet.
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<h2 className="text-lg font-bold text-gray-900 mb-4">Badges</h2>
							<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
								No badges earned yet.
							</div>
						</section>
					</div>
				</div>
			</div>
		</Shell>
	);
}
