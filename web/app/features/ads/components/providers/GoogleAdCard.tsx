import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { AdCardCore } from "../core/AdCardCore";
import type { GoogleAdCardProps } from "../types";
import { ALLOWED_GOOGLE_LABELS } from "../types";
import {
	clearSlot,
	loadGoogleAdsScript,
	pushAdSlot,
} from "./GoogleAdsManager.client";

const AD_LOAD_TIMEOUT = 5000; // 5 seconds

/**
 * GoogleAdCard - Provider for Google Ads
 *
 * Features:
 * - Policy-compliant labeling (enforced)
 * - Consent state management
 * - Singleton script loading
 * - Duplicate slot prevention
 * - Timeout fallback
 * - Route navigation cleanup
 *
 * @example
 * ```tsx
 * <GoogleAdCard
 *   slot="1234567890"
 *   layout="sidebar"
 *   consentState="granted"
 * />
 * ```
 */
export function GoogleAdCard({
	slot,
	layout,
	consentState = "unknown",
	fallback,
	onLoad,
	onError,
}: GoogleAdCardProps) {
	const _location = useLocation();
	const [scriptLoaded, setScriptLoaded] = useState(false);
	const [timedOut, setTimedOut] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Label must be policy-compliant (enforced in code)
	const label: (typeof ALLOWED_GOOGLE_LABELS)[number] = "Advertisements";

	// Validate label in development
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			if (!ALLOWED_GOOGLE_LABELS.includes(label as never)) {
				throw new Error(
					`Google Ads Policy Violation: label must be one of ${ALLOWED_GOOGLE_LABELS.join(", ")}`,
				);
			}
		}
	}, []);

	// Load Google Ads script
	useEffect(() => {
		if (typeof window === "undefined") return;

		let mounted = true;

		loadGoogleAdsScript()
			.then(() => {
				if (mounted) {
					setScriptLoaded(true);
					onLoad?.();
				}
			})
			.catch((err) => {
				if (mounted) {
					setError(err);
					onError?.(err);
				}
			});

		return () => {
			mounted = false;
		};
	}, [onLoad, onError]);

	// Push ad slot when script loaded
	useEffect(() => {
		if (scriptLoaded && typeof window !== "undefined") {
			const success = pushAdSlot(slot);
			if (!success && process.env.NODE_ENV === "development") {
				console.warn(`[GoogleAdCard] Failed to push slot: ${slot}`);
			}
		}
	}, [scriptLoaded, slot]);

	// Cleanup on route navigation
	useEffect(() => {
		return () => {
			clearSlot(slot);
		};
	}, [slot]);

	// Timeout fallback
	useEffect(() => {
		const timer = setTimeout(() => {
			setTimedOut(true);
		}, AD_LOAD_TIMEOUT);

		return () => clearTimeout(timer);
	}, []);

	// Handle consent state = denied
	if (consentState === "denied") {
		return null;
	}

	// Handle consent state = unknown
	if (consentState === "unknown") {
		return (
			<AdCardCore label={label} layout={layout}>
				<div className="ad-card-body--empty">
					<div className="consent-pending">
						<p className="text-gray-600 text-sm dark:text-gray-400">
							광고 표시를 위해 쿠키 동의가 필요합니다
						</p>
					</div>
				</div>
			</AdCardCore>
		);
	}

	// Show fallback on timeout
	if (timedOut && !scriptLoaded) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<AdCardCore label={label} layout={layout}>
				<div className="ad-card-body--error">
					<p className="text-sm">광고를 불러올 수 없습니다</p>
				</div>
			</AdCardCore>
		);
	}

	// Show fallback on error
	if (error) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<AdCardCore label={label} layout={layout}>
				<div className="ad-card-body--error">
					<p className="text-sm">광고를 불러올 수 없습니다</p>
					{process.env.NODE_ENV === "development" && (
						<p className="text-gray-500 text-xs">{error.message}</p>
					)}
				</div>
			</AdCardCore>
		);
	}

	// Render Google Ad
	return (
		<AdCardCore label={label} layout={layout}>
			{!scriptLoaded ? (
				<div className="ad-card-body--loading">
					<div className="animate-pulse">
						<div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
						<div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
					</div>
				</div>
			) : (
				<ins
					className="adsbygoogle"
					style={{ display: "block" }}
					data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // TODO: Replace with actual publisher ID
					data-ad-slot={slot}
					data-ad-format="auto"
					data-full-width-responsive="true"
				/>
			)}
		</AdCardCore>
	);
}
