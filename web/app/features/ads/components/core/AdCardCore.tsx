import { useEffect, useRef } from "react";
import type { AdCardCoreProps } from "../types";
import "./AdCardCore.css";

/**
 * AdCardCore - Common card frame for all ad providers
 *
 * Responsibilities:
 * - Standard header/body/footer structure
 * - CLS prevention via minHeight
 * - Safety guards (spacing, overlay detection)
 * - Layout presets (sidebar, feed, inline)
 *
 * @example
 * ```tsx
 * <AdCardCore
 *   label="Advertisements"
 *   layout="sidebar"
 *   minHeight="400px"
 * >
 *   {children}
 * </AdCardCore>
 * ```
 */
export function AdCardCore({
	label,
	title,
	rightAction,
	layout,
	minHeight,
	children,
	footer,
	allowInOverlay = false,
	className = "",
}: AdCardCoreProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Safety guard: Check if inside overlay/modal
	useEffect(() => {
		if (!allowInOverlay && cardRef.current) {
			const isInOverlay = !!cardRef.current.closest(
				'[role="dialog"], [role="alertdialog"], .modal, .overlay',
			);

			if (isInOverlay && process.env.NODE_ENV === "development") {
				console.warn(
					"[AdCardCore] Ad placement in overlay/modal detected. Set allowInOverlay=true to suppress this warning.",
				);
			}
		}
	}, [allowInOverlay]);

	// Safety guard: Check proximity to navigation (dev mode only)
	useEffect(() => {
		if (process.env.NODE_ENV === "development" && cardRef.current) {
			const navElements = document.querySelectorAll('nav, [role="navigation"]');

			for (const nav of navElements) {
				const navRect = nav.getBoundingClientRect();
				const cardRect = cardRef.current.getBoundingClientRect();

				const MIN_SPACING = 12; // px
				const distance = Math.abs(navRect.bottom - cardRect.top);

				if (distance < MIN_SPACING && distance > 0) {
					console.warn(
						`[AdCardCore] Ad too close to navigation (${distance}px). Minimum spacing: ${MIN_SPACING}px`,
					);
				}
			}
		}
	}, []);

	// If in overlay and not allowed, don't render
	if (!allowInOverlay && typeof document !== "undefined") {
		const isInOverlay = cardRef.current?.closest(
			'[role="dialog"], [role="alertdialog"], .modal, .overlay',
		);
		if (isInOverlay) {
			return null;
		}
	}

	return (
		<div
			ref={cardRef}
			className={`ad-card-core ad-card-core--${layout} ${className}`}
			data-layout={layout}
		>
			{/* Header */}
			<header className="ad-card-header">
				<div className="ad-card-header__left">
					<span className="ad-label">{label}</span>
					{title && <h3 className="ad-card-title">{title}</h3>}
				</div>
				{rightAction && (
					<div className="ad-card-header__right">{rightAction}</div>
				)}
			</header>

			{/* Body: Provider Rendering Area */}
			<div className="ad-card-body" style={{ minHeight }}>
				{children}
			</div>

			{/* Footer */}
			{footer && <footer className="ad-card-footer">{footer}</footer>}
		</div>
	);
}
