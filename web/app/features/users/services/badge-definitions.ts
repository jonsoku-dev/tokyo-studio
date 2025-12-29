/**
 * SPEC 005: Badge System Definitions
 *
 * Defines all available badges, their criteria, and visual appearance
 */

export interface BadgeCriteria {
	type:
		| "email_verified"
		| "mentor_sessions"
		| "community_posts"
		| "profile_complete";
	threshold?: number;
	minUpvotes?: number;
	inverse?: boolean; // Award if condition is NOT met (for "New Mentor" badge)
}

export interface BadgeDefinition {
	id: string;
	name: string;
	description: string;
	icon: string; // Lucide icon name
	color: string; // Hex color
	criteria: BadgeCriteria;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
	{
		id: "verified",
		name: "Verified",
		description: "Email verified account",
		icon: "ShieldCheck",
		color: "#10B981", // green-500
		criteria: { type: "email_verified" },
	},
	{
		id: "new-mentor",
		name: "New Mentor",
		description: "New to mentoring (less than 5 sessions)",
		icon: "Sparkles",
		color: "#10B981", // green-500
		criteria: { type: "mentor_sessions", threshold: 5, inverse: true },
	},
	{
		id: "mentor",
		name: "Mentor",
		description: "Verified mentor with 5+ completed sessions",
		icon: "GraduationCap",
		color: "#3B82F6", // blue-500
		criteria: { type: "mentor_sessions", threshold: 5 },
	},
	{
		id: "top-contributor",
		name: "Top Contributor",
		description: "10+ helpful community posts with 50+ total upvotes",
		icon: "Star",
		color: "#F59E0B", // amber-500
		criteria: { type: "community_posts", threshold: 10, minUpvotes: 50 },
	},
	{
		id: "profile-master",
		name: "Profile Master",
		description: "Complete profile with avatar, bio, and social links",
		icon: "User",
		color: "#8B5CF6", // purple-500
		criteria: { type: "profile_complete" },
	},
];

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | null {
	return BADGE_DEFINITIONS.find((b) => b.id === badgeId) || null;
}

/**
 * Get all badge definitions
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
	return BADGE_DEFINITIONS;
}
