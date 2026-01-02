import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

// --- Variants ---

const sidebarCardVariants = cva(
	"overflow-hidden rounded-2xl border shadow-sm transition-all",
	{
		variants: {
			variant: {
				default: "bg-white border-gray-100 shadow-gray-100/50",
				highlight: "bg-primary-50 border-primary-100 shadow-primary-100/50",
				warning: "bg-amber-50 border-amber-200 shadow-amber-100/50",
				ghost: "bg-transparent border-transparent shadow-none",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const sidebarHeaderVariants = cva(
	"flex items-center justify-between px-4 py-3",
	{
		variants: {
			variant: {
				default: "border-b border-gray-100",
				highlight: "border-b border-primary-100",
				warning: "border-b border-amber-200",
				ghost: "",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

// --- SidebarCard ---

interface SidebarCardProps
	extends HTMLAttributes<HTMLElement>,
		VariantProps<typeof sidebarCardVariants> {
	children: ReactNode;
	/** Use div instead of section (for nested contexts) */
	asDiv?: boolean;
}

/**
 * SidebarCard - A container component for sidebar content blocks.
 *
 * @accessibility
 * - Uses semantic <section> by default for landmark navigation
 * - Supports aria-labelledby for accessible naming
 * - Supports aria-label as fallback
 * - Use asDiv=true when nesting to avoid section-in-section
 */
export function SidebarCard({
	className,
	variant,
	children,
	asDiv = false,
	...props
}: SidebarCardProps) {
	const classes = cn(sidebarCardVariants({ variant }), className);
	
	if (asDiv) {
		return (
			<div className={classes} {...props}>
				{children}
			</div>
		);
	}
	
	return (
		<section className={classes} {...props}>
			{children}
		</section>
	);
}

// --- SidebarCardHeader ---

interface SidebarCardHeaderProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
		VariantProps<typeof sidebarHeaderVariants> {
	/** Title text or element */
	title?: ReactNode;
	/** Icon element to display before title */
	icon?: ReactNode;
	/** Action element (button/link) to display on the right */
	action?: ReactNode;
	/** Heading level for the title. Defaults to 3. */
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	/** ID for the heading, used with aria-labelledby on the parent card */
	headingId?: string;
}

/**
 * SidebarCardHeader - Header section with title, icon, and optional action.
 *
 * @accessibility
 * - Renders proper heading hierarchy (h2-h6)
 * - Supports headingId for aria-labelledby connection
 * - Icon is decorative (aria-hidden by wrapper)
 */
export function SidebarCardHeader({
	className,
	variant,
	title,
	icon,
	action,
	headingLevel = 3,
	headingId,
	children,
	...props
}: SidebarCardHeaderProps) {
	const HeadingTag = `h${headingLevel}` as const;

	// If children provided, render them directly (full customization)
	if (children) {
		return (
			<div
				className={cn(sidebarHeaderVariants({ variant }), className)}
				{...props}
			>
				{children}
			</div>
		);
	}

	// Default structured header rendering
	return (
		<div
			className={cn(sidebarHeaderVariants({ variant }), className)}
			{...props}
		>
			<div className="flex items-center gap-2">
				{icon && (
					<span className="flex-shrink-0 text-gray-500" aria-hidden="true">
						{icon}
					</span>
				)}
				{title && (
					<HeadingTag
						id={headingId}
						className="font-semibold text-gray-900 text-sm"
					>
						{title}
					</HeadingTag>
				)}
			</div>
			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}

// --- SidebarCardBody ---

interface SidebarCardBodyProps extends HTMLAttributes<HTMLDivElement> {
	/** Remove default padding */
	noPadding?: boolean;
}

/**
 * SidebarCardBody - Main content area of the card.
 *
 * @accessibility
 * - Generic container, no special a11y requirements
 * - Content inside should follow proper heading hierarchy
 */
export function SidebarCardBody({
	className,
	children,
	noPadding = false,
	...props
}: SidebarCardBodyProps) {
	// Don't render if no children (edge case)
	if (!children) {
		return null;
	}

	return (
		<div className={cn(noPadding ? "" : "px-4 py-3", className)} {...props}>
			{children}
		</div>
	);
}

// --- SidebarCardFooter ---

interface SidebarCardFooterProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * SidebarCardFooter - Footer section for actions or meta info.
 *
 * @accessibility
 * - Buttons/links inside should have proper labels
 * - Consider role="group" if containing multiple related actions
 */
export function SidebarCardFooter({
	className,
	children,
	...props
}: SidebarCardFooterProps) {
	// Don't render if no children (edge case)
	if (!children) {
		return null;
	}

	return (
		<div
			className={cn("border-t border-gray-100 bg-gray-50/50 px-4 py-3", className)}
			{...props}
		>
			{children}
		</div>
	);
}

// --- Compound Component Export ---

/**
 * Sidebar - Compound component for building sidebar cards.
 *
 * @example
 * ```tsx
 * <Sidebar.Card aria-labelledby="about-heading">
 *   <Sidebar.Header icon={<Info />} title="About" headingId="about-heading" />
 *   <Sidebar.Body>Content here</Sidebar.Body>
 *   <Sidebar.Footer>Actions here</Sidebar.Footer>
 * </Sidebar.Card>
 * ```
 */
export const Sidebar = {
	Card: SidebarCard,
	Header: SidebarCardHeader,
	Body: SidebarCardBody,
	Footer: SidebarCardFooter,
};
