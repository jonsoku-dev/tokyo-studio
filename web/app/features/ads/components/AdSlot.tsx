import { GoogleAdCard } from "./providers/GoogleAdCard";
import { HouseAdCard } from "./providers/HouseAdCard";
import type { AdSlotProps } from "./types";

/**
 * AdSlot - Unified entry point for all ad providers
 *
 * Uses discriminated union to provide type-safe props
 * based on the selected provider.
 *
 * @example Google Ads
 * ```tsx
 * <AdSlot
 *   provider="google"
 *   slot="1234567890"
 *   layout="sidebar"
 *   consentState="granted"
 * />
 * ```
 *
 * @example House Ads
 * ```tsx
 * <AdSlot
 *   provider="house"
 *   placement="feed-middle"
 *   layout="feed"
 *   context={{ category: 'frontend' }}
 * />
 * ```
 */
export function AdSlot(props: AdSlotProps) {
	if (props.provider === "google") {
		return (
			<GoogleAdCard
				slot={props.slot}
				layout={props.layout}
				consentState={props.consentState}
				fallback={props.fallback}
			/>
		);
	}

	if (props.provider === "house") {
		return (
			<HouseAdCard
				placement={props.placement}
				layout={props.layout}
				ad={props.ad}
				fallback={props.fallback}
			/>
		);
	}

	// TypeScript exhaustiveness check
	const _exhaustive: never = props;
	return null;
}
