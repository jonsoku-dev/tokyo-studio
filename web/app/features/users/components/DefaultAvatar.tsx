import {
	getAvatarColorForUser,
	getInitials,
} from "~/shared/utils/avatar-color";

interface DefaultAvatarProps {
	userId: string;
	name?: string | null;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const sizeMap = {
	sm: "w-8 h-8 text-xs",
	md: "w-10 h-10 text-sm",
	lg: "w-16 h-16 text-lg",
	xl: "w-32 h-32 text-4xl",
};

/**
 * Generates a color-coded default avatar with user initials
 * Used when no profile picture is uploaded
 */
export function DefaultAvatar({
	userId,
	name,
	size = "md",
	className = "",
}: DefaultAvatarProps) {
	const initials = getInitials(name);
	const colors = getAvatarColorForUser(userId);

	return (
		<div
			className={`center rounded-full font-bold flex-shrink-0 ${sizeMap[size]} ${className}`}
			style={{
				backgroundColor: colors.bg,
				color: colors.text,
			}}
			title={name || undefined}
		>
			{initials}
		</div>
	);
}

/**
 * Avatar component that shows either the profile picture or a default avatar
 */
interface AvatarProps extends DefaultAvatarProps {
	src?: string | null;
	alt?: string;
}

export function Avatar({
	userId,
	name,
	size = "md",
	src,
	alt,
	className,
}: AvatarProps) {
	if (src) {
		return (
			<img
				src={src}
				alt={alt || name || "User avatar"}
				className={`rounded-full flex-shrink-0 ${sizeMap[size]} ${className}`}
				loading="lazy"
			/>
		);
	}

	return (
		<DefaultAvatar
			userId={userId}
			name={name}
			size={size}
			className={className}
		/>
	);
}
