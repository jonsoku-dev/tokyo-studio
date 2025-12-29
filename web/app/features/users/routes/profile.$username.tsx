import { db } from "@itcom/db/client";
import { profiles, userSlugHistory } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import { Github, Globe, Languages, Linkedin, MapPin } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { MentorService } from "~/features/mentoring/services/mentor.server";
import type { Slot } from "~/features/mentoring/types";
import { Shell } from "~/shared/components/layout/Shell";
import { ProfileBadges } from "../components/ProfileBadges";
import { getUserActivityStats } from "../services/activity-stats.server";
import { getUserBadges } from "../services/badge-system.server";
import { profileService } from "../services/profile.server";
import type { Route } from "./+types/profile.$username";

export async function loader({ params }: LoaderFunctionArgs) {
	const { username } = params;
	if (!username) {
		throw new Response("Username required", { status: 400 });
	}

	const [profile, mentorProfile] = await Promise.all([
		profileService.getPublicProfile(username),
		MentorService.getMentorProfile(username),
	]);

	if (!profile) {
		// Check slug history for old slugs
		const slugHistory = await db.query.userSlugHistory.findFirst({
			where: eq(userSlugHistory.slug, username),
		});

		if (slugHistory && !slugHistory.isPrimary) {
			// Find current primary slug for this user
			const currentProfile = await db.query.profiles.findFirst({
				where: eq(profiles.userId, slugHistory.userId),
				columns: { slug: true },
			});

			if (currentProfile?.slug) {
				// 301 permanent redirect to current slug
				throw redirect(`/profile/${currentProfile.slug}`, 301);
			}
		}

		throw new Response("Profile not found", { status: 404 });
	}

	// Get user badges and activity stats in parallel
	const [badges, activityStats] = await Promise.all([
		getUserBadges(profile.user.id),
		getUserActivityStats(profile.user.id),
	]);

	let slots: Slot[] = [];
	let reviews: Awaited<ReturnType<typeof MentorService.getMentorReviews>> = [];
	if (mentorProfile) {
		const start = new Date();
		const end = new Date();
		end.setDate(end.getDate() + 7);
		const [rawSlots, mentorReviews] = await Promise.all([
			MentorService.getAvailability(mentorProfile.id, start, end),
			MentorService.getMentorReviews(mentorProfile.id, 10),
		]);
		slots = rawSlots.map((s) => ({
			...s,
			status: (s.status as "available" | "booked" | "locked") || "available",
		}));
		reviews = mentorReviews;
	}

	return { profile, mentorProfile, slots, reviews, badges, activityStats };
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
	const { profile, mentorProfile, badges, activityStats } = loaderData;
	const { user } = profile;

	return (
		<Shell>
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Standard Profile Header */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

							{/* Badges */}
							{badges.length > 0 && (
								<div className="mt-6">
									<ProfileBadges badges={badges} />
								</div>
							)}

							{/* Activity Stats */}
							<div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">
										{activityStats.communityPosts}
									</div>
									<div className="text-xs text-gray-500 mt-1">Posts</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">
										{activityStats.comments}
									</div>
									<div className="text-xs text-gray-500 mt-1">Comments</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">
										{activityStats.mentoringSessions}
									</div>
									<div className="text-xs text-gray-500 mt-1">
										Mentor Sessions
									</div>
								</div>
							</div>

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

				{/* Mentor Section */}

				{!mentorProfile && (
					<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-2 space-y-6">
							<section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
								<h2 className="text-lg font-bold text-gray-900 mb-4">
									Activity
								</h2>
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
				)}
			</div>
		</Shell>
	);
}
