/**
 * Generate consistent avatar colors based on user ID
 * Uses the same user ID to always produce the same color (deterministic)
 */

const COLORS = [
	{ bg: "#FF6B6B", text: "#FFFFFF" }, // Red
	{ bg: "#4ECDC4", text: "#FFFFFF" }, // Teal
	{ bg: "#45B7D1", text: "#FFFFFF" }, // Blue
	{ bg: "#FFA07A", text: "#FFFFFF" }, // Light Salmon
	{ bg: "#98D8C8", text: "#FFFFFF" }, // Mint
	{ bg: "#F7DC6F", text: "#000000" }, // Yellow
	{ bg: "#BB8FCE", text: "#FFFFFF" }, // Purple
	{ bg: "#85C1E2", text: "#FFFFFF" }, // Light Blue
	{ bg: "#F8B88B", text: "#FFFFFF" }, // Peach
	{ bg: "#A3D977", text: "#FFFFFF" }, // Light Green
];

/**
 * Generate a color pair (background and text) based on user ID
 * Ensures the same user ID always gets the same color
 */
export function getAvatarColorForUser(userId: string): {
	bg: string;
	text: string;
} {
	// Convert userId to a number for consistent color selection
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		const char = userId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}

	const index = Math.abs(hash) % COLORS.length;
	return COLORS[index];
}

/**
 * Extract initials from a name (first letter of first and last name, or first 2 characters)
 */
export function getInitials(name?: string | null): string {
	if (!name) return "?";

	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (
			parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
		).toUpperCase();
	}

	return name.slice(0, 2).toUpperCase();
}

/**
 * Generate a styled avatar element as HTML string (for email templates, etc.)
 */
export function generateAvatarHTML(name: string, size = 40): string {
	const initials = getInitials(name);
	const colors = getAvatarColorForUser(name);
	const fontSize = Math.round(size * 0.35);

	return `
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${colors.bg};
      color: ${colors.text};
      font-weight: bold;
      font-size: ${fontSize}px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      ${initials}
    </div>
  `;
}
