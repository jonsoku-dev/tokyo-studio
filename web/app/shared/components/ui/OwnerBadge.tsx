import { Crown } from "lucide-react";
import { cn } from "~/shared/utils/cn";

interface OwnerBadgeProps {
	/** Size variant */
	size?: "sm" | "md";
	/** Additional class names */
	className?: string;
	/** Label text (default: "내 커뮤니티") */
	label?: string;
}

/**
 * OwnerBadge - A badge indicating ownership of a community.
 *
 * @accessibility
 * - Uses semantic span with role="status" for screen readers
 * - Crown icon is decorative (aria-hidden)
 */
export function OwnerBadge({
	size = "md",
	className,
	label = "내 커뮤니티",
}: OwnerBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700",
				size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
				className,
			)}
		>
			<Crown
				className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
				aria-hidden="true"
			/>
			<span className="font-semibold">{label}</span>
		</span>
	);
}
