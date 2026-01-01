import { Star } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/Badge";
import type { Mentor } from "../domain/mentoring.types";

interface MentorCardProps {
	mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
	if (!mentor.profile) return null;

	// Actually Mentor interface in types.ts is { profile: ... } & User.
	// So mentor directly has name, avatarUrl.

	// Rating handling: stored as integer * 100.
	const ratingValue = (mentor.profile.averageRating || 0) / 100;
	const formattedRating = ratingValue.toFixed(1);

	return (
		<Link
			to={`/mentoring/mentors/${mentor.id}`}
			className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-primary/20 dark:border-white/5 dark:bg-black/20"
		>
			<div className="flex items-start gap-4">
				<div className="relative">
					<img
						src={
							mentor.avatarUrl ||
							`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`
						}
						alt={mentor.name}
						className="h-16 w-16 rounded-full border-2 border-white/10 object-cover shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:border-primary/50"
					/>
					<div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[10px] backdrop-blur-md">
						🇯🇵
					</div>
				</div>

				<div className="flex-1">
					<h3 className="font-outfit heading-5 group-hover:text-primary dark:text-gray-100">
						{mentor.name}
					</h3>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
						{mentor.profile.jobTitle}
					</p>
					<p className="caption dark:text-gray-500">
						{mentor.profile.company}
					</p>

					<div className="mt-2 flex flex-wrap gap-1">
						{mentor.profile.specialties?.slice(0, 2).map((skill: string) => (
							<Badge
								key={skill}
								variant="secondary"
								className="bg-white/5 text-[10px] hover:bg-primary/20 hover:text-primary"
							>
								{skill}
							</Badge>
						))}
						{(mentor.profile.specialties?.length || 0) > 2 && (
							<Badge variant="secondary" className="bg-white/5 text-[10px]">
								+{(mentor.profile.specialties?.length || 0) - 2}
							</Badge>
						)}
					</div>
				</div>

				<div className="text-right">
					<div className="heading-5 dark:text-white">
						${((mentor.profile.hourlyRate || 0) / 100).toFixed(0)}
						<span className="text-xs font-normal text-gray-500">/h</span>
					</div>
					<div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-amber-400">
						<Star className="h-3 w-3 fill-current" />
						<span>{formattedRating}</span>
						<span className="text-gray-500">
							({mentor.profile.totalSessions})
						</span>
					</div>
				</div>
			</div>

			{/* Hover Action */}
			<div className="absolute inset-x-5 bottom-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden">
				{/* This approach needs card to grow or something.
                     For MVP simple card, just make whole card clickable.
                 */}
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 caption">
				<div className="flex items-center gap-2">
					<span>{mentor.profile.yearsOfExperience} years exp.</span>
				</div>
				<div className="font-medium text-primary">View Profile →</div>
			</div>
		</Link>
	);
}
