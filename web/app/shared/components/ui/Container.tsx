import type { ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

interface ContainerProps {
	children: ReactNode;
	className?: string;
	variant?: "wide" | "page" | "narrow" | "prose" | "full";
}

export function Container({
	children,
	className,
	variant = "page",
}: ContainerProps) {
	const variantClass = {
		wide: "container-wide",
		page: "container-page",
		narrow: "container-narrow",
		prose: "container-prose",
		full: "w-full",
	}[variant];

	return <div className={cn(variantClass, className)}>{children}</div>;
}
