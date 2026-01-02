import { AD_IMAGE_SPECS } from "../../config/image-specs";
import { AdCardCore } from "../core/AdCardCore";
import type { HouseAdCardProps, HouseAdCreative } from "../types";

/**
 * HouseAdCreative - Renders the actual ad creative
 */
function HouseAdCreativeComponent({
	ad,
	placement,
}: {
	ad: HouseAdCreative;
	placement: string;
}) {
	const handleClick = () => {
		// Track click event
		if (typeof window !== "undefined" && ad.trackingId) {
			// TODO: Implement click tracking
			// fetch(`/api/ads/track`, {
			//   method: 'POST',
			//   body: JSON.stringify({ trackingId: ad.trackingId, event: 'click' })
			// });
		}
	};

	return (
		<a
			href={ad.ctaUrl}
			onClick={handleClick}
			className="group block"
			target="_blank"
			rel="noopener noreferrer sponsored"
		>
			{ad.imageUrl && (
				<div className="mb-3 overflow-hidden rounded-lg">
					<img
						src={ad.imageUrl}
						alt={ad.title}
						className="h-auto w-full object-contain"
						style={{
							aspectRatio: String(
								AD_IMAGE_SPECS[placement as keyof typeof AD_IMAGE_SPECS]
									?.aspectRatio || 16 / 9,
							),
						}}
					/>
				</div>
			)}

			<h3 className="mb-1 font-semibold text-base text-gray-900 transition-colors group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
				{ad.title}
			</h3>

			<p className="mb-3 line-clamp-2 text-gray-600 text-sm dark:text-gray-400">
				{ad.description}
			</p>

			<div className="inline-flex items-center gap-1 font-medium text-primary-600 text-sm transition-all group-hover:gap-2 dark:text-primary-400">
				<span>{ad.ctaText}</span>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<title>Arrow icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</div>
		</a>
	);
}

/**
 * HouseAdCard - Provider for House Ads (SSR-first approach)
 *
 * Features:
 * - Server-side ad fetching via loader (recommended)
 * - Graceful empty state
 * - Click/impression tracking
 * - Targeting support
 *
 * @example SSR-first (recommended)
 * ```tsx
 * // In loader:
 * const feedAd = await getHouseAd("feed-middle", { category: "community" });
 *
 * // In component:
 * <HouseAdCard
 *   placement="feed-middle"
 *   layout="feed"
 *   ad={feedAd?.ad}
 * />
 * ```
 */
export function HouseAdCard({
	placement,
	layout,
	ad,
	fallback,
	onLoad,
	onError,
}: HouseAdCardProps) {
	// No ad available (server returned null or no-inventory)
	if (!ad) {
		onError?.(new Error("No ad available"));

		// Return fallback or graceful empty state
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<AdCardCore label="Sponsored" layout={layout} minHeight="200px">
				<div className="ad-card-body--empty" />
			</AdCardCore>
		);
	}

	// Success - render ad
	onLoad?.();

	return (
		<AdCardCore label="Sponsored" layout={layout}>
			<HouseAdCreativeComponent ad={ad} placement={placement} />
		</AdCardCore>
	);
}
