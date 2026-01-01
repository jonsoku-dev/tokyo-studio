import type * as React from "react";
import { cn } from "~/shared/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?:
		| "primary"
		| "secondary"
		| "accent"
		| "success"
		| "warning"
		| "danger"
		| "outline";
}

function Badge({ className, variant = "primary", ...props }: BadgeProps) {
	const variants = {
		primary: "badge-primary",
		secondary: "badge-secondary",
		accent: "badge-accent",
		success: "badge-success",
		warning: "badge-warning",
		danger: "badge-danger",
		outline: "badge-outline",
	};

	return (
		<div className={cn("badge", variants[variant], className)} {...props} />
	);
}

export { Badge };
