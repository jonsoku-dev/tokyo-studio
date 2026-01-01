import type * as React from "react";
import { cn } from "~/shared/utils/cn";

export function Label({
	className,
	...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Generic label component
		<label className={cn("label", className)} {...props} />
	);
}
