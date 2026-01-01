/**
 * SPEC 005: Profile Badges Component
 *
 * Displays user badges on public profile
 */

import {
	GraduationCap,
	type LucideIcon,
	ShieldCheck,
	Sparkles,
	Star,
	User,
} from "lucide-react";

interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	awardedAt: Date;
}

interface ProfileBadgesProps {
	badges: Badge[];
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
	ShieldCheck,
	Sparkles,
	GraduationCap,
	Star,
	User,
};

export function ProfileBadges({ badges }: ProfileBadgesProps) {
	if (badges.length === 0) {
		return null;
	}

	return (
		<div className="stack-sm">
			<h3 className="body-sm text-gray-700 uppercase tracking-wider">Badges</h3>
			<div className="cluster-sm">
				{badges.map((badge) => {
					const Icon = ICON_MAP[badge.icon] || ShieldCheck;

					return (
						<div
							key={badge.id}
							className="group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:shadow-md"
							style={{
								backgroundColor: `${badge.color}20`,
								color: badge.color,
								borderWidth: "1px",
								borderColor: `${badge.color}40`,
							}}
							title={badge.description}
						>
							<Icon className="h-4 w-4" />
							<span className="font-medium text-sm">{badge.name}</span>

							{/* Tooltip */}
							<div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
								{badge.description}
								<div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2">
									<div className="border-4 border-transparent border-t-gray-900" />
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
