import { Star } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/Badge";
import type { Mentor } from "../domain/mentoring.types";

interface MentorCardProps {
	mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
	if (!mentor.profile) return null;

	// Rating handling: stored as integer * 100.
	const ratingValue = (mentor.profile.averageRating || 0) / 100;
	const formattedRating = ratingValue.toFixed(1);

	return (
		<Link
			to={`/mentoring/mentors/${mentor.id}`}
			className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-primary-200 hover:shadow-md hover:ring-1 hover:ring-primary-200"
		>
			<div className="flex items-start gap-4">
				<div className="relative">
					<img
						src={
							mentor.avatarUrl ||
							`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`
						}
						alt={mentor.name}
						className="h-14 w-14 rounded-full border border-gray-100 object-cover"
					/>
					<div className="center absolute -right-1 -bottom-1 h-5 w-5 rounded-full border border-gray-100 bg-white text-[10px] shadow-sm">
						🇯🇵
					</div>
				</div>

				<div className="min-w-0 flex-1">
					<h3 className="heading-5 truncate text-gray-900 group-hover:text-primary-600">
						{mentor.name}
					</h3>
					<p className="body-sm truncate text-gray-600">
						{mentor.profile.jobTitle}
					</p>
					<p className="caption truncate text-gray-500">
						{mentor.profile.company}
					</p>

					<div className="mt-3 flex flex-wrap gap-1.5">
						{mentor.profile.specialties?.slice(0, 2).map((skill: string) => (
							<Badge
								key={skill}
								variant="secondary"
								className="border-gray-100 bg-gray-50 px-1.5 py-0.5 font-normal text-[10px] text-gray-600"
							>
								{skill}
							</Badge>
						))}
						{(mentor.profile.specialties?.length || 0) > 2 && (
							<Badge
								variant="secondary"
								className="border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500"
							>
								+{(mentor.profile.specialties?.length || 0) - 2}
							</Badge>
						)}
					</div>
				</div>

				<div className="shrink-0 text-right">
					<div className="heading-5 text-gray-900">
						${((mentor.profile.hourlyRate || 0) / 100).toFixed(0)}
						<span className="caption ml-0.5 font-normal text-gray-500">/h</span>
					</div>
					<div className="caption mt-1 flex items-center justify-end gap-1 font-medium text-amber-500">
						<Star className="h-3 w-3 fill-current" />
						<span>{formattedRating}</span>
						<span className="font-normal text-gray-400">
							({mentor.profile.totalSessions})
						</span>
					</div>
				</div>
			</div>

			<div className="caption mt-4 flex items-center justify-between border-gray-100 border-t pt-3">
				<div className="flex items-center gap-2 text-gray-500">
					<span>{mentor.profile.yearsOfExperience} years exp.</span>
				</div>
				<div className="font-medium text-primary-600 transition-colors group-hover:text-primary-700 group-hover:underline">
					View Profile →
				</div>
			</div>
		</Link>
	);
}
