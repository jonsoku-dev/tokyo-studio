import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/shared/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "icon" | "sm" | "md" | "lg";
	fullWidth?: boolean;
	asChild?: boolean;
}

export function Button({
	className,
	variant = "primary",
	size = "md",
	fullWidth = false,
	asChild = false,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	const variants = {
		primary: "btn-primary",
		secondary: "btn-secondary",
		outline: "btn-outline",
		ghost: "btn-ghost",
	};

	const sizes = {
		icon: "h-9 w-9 p-0 flex items-center justify-center",
		sm: "btn-sm",
		md: "btn-md",
		lg: "btn-lg",
	};

	return (
		<Comp
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
		</Comp>
	);
}
