import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/shared/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

export function Button({
	className,
	variant = "primary",
	size = "md",
	fullWidth = false,
	children,
	...props
}: ButtonProps) {
	const variants = {
		primary: "btn-primary",
		secondary: "btn-secondary",
		outline: "btn-outline",
		ghost: "btn-ghost",
	};

	const sizes = {
		sm: "btn-sm",
		md: "btn-md",
		lg: "btn-lg",
	};

	return (
		<button
			className={cn(
				"btn",
				variants[variant],
				sizes[size],
				fullWidth && "w-full",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
