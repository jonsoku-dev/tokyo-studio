import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

// --- Variants ---

const sidebarCardVariants = cva(
	"overflow-hidden rounded-3xl border shadow-sm transition-all",
	{
		variants: {
			variant: {
				default: "bg-white border-gray-100 shadow-gray-200/50",
				highlight: "bg-primary-50 border-primary-100 shadow-primary-100/50",
				warning: "bg-yellow-50 border-yellow-200 shadow-yellow-100/50", // Useful for Mod Tools
				ghost: "bg-transparent border-transparent shadow-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const sidebarHeaderVariants = cva("flex items-center justify-between px-5 py-4", {
	variants: {
		variant: {
			default: "border-b border-gray-50",
			highlight: "border-b border-primary-100",
			warning: "border-b border-yellow-100",
			ghost: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

// --- Components ---

interface SidebarCardProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof sidebarCardVariants> {
	children: ReactNode;
}

export function SidebarCard({
	className,
	variant,
	children,
	...props
}: SidebarCardProps) {
	return (
		<section
			className={cn(sidebarCardVariants({ variant }), className)}
			{...props}
		>
			{children}
		</section>
	);
}

interface SidebarHeaderProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof sidebarHeaderVariants> {
	title?: ReactNode; // Can be string or element
	icon?: ReactNode;
	action?: ReactNode;
}

export function SidebarCardHeader({
	className,
	variant,
	title,
	icon,
	action,
	children,
	...props
}: SidebarHeaderProps) {
	return (
		<div className={cn(sidebarHeaderVariants({ variant }), className)} {...props}>
			{children || (
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						{icon && <span className="text-gray-500">{icon}</span>}
						{title && (
							<h3 className="font-bold text-gray-900 text-sm">{title}</h3>
						)}
					</div>
					{action && <div className="text-xs">{action}</div>}
				</div>
			)}
		</div>
	);
}

interface SidebarBodyProps extends HTMLAttributes<HTMLDivElement> {
	noPadding?: boolean;
}

export function SidebarCardBody({
	className,
	children,
	noPadding = false,
	...props
}: SidebarBodyProps) {
	return (
		<div className={cn(noPadding ? "" : "p-5", className)} {...props}>
			{children}
		</div>
	);
}

interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarCardFooter({
	className,
	children,
	...props
}: SidebarFooterProps) {
	return (
		<div
			className={cn("border-t border-gray-50 bg-gray-50/50 px-5 py-3", className)}
			{...props}
		>
			{children}
		</div>
	);
}

// Attach subcomponents for convenient import (Optional but nice pattern)
export const Sidebar = {
    Card: SidebarCard,
    Header: SidebarCardHeader,
    Body: SidebarCardBody,
    Footer: SidebarCardFooter
}
