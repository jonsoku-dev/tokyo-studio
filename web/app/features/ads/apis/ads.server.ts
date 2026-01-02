import { db } from "@itcom/db";
import { houseAds } from "@itcom/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import type {
	HouseAdRequest,
	HouseAdResponse,
} from "~/features/ads/components/types";
import { loaderHandler } from "~/shared/lib";

/**
 * House Ads Serve API
 *
 * GET /api/ads/serve?placement=sidebar&context={"category":"frontend"}
 *
 * Returns an ad creative for the given placement and context
 */
export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const placement = url.searchParams.get("placement");
	const contextStr = url.searchParams.get("context");

	if (!placement) {
		return {
			success: false,
			reason: "no-inventory",
		} satisfies HouseAdResponse;
	}

	// Parse context
	let context: HouseAdRequest["context"];
	if (contextStr) {
		try {
			context = JSON.parse(contextStr);
		} catch {
			// Invalid JSON, ignore context
			context = undefined;
		}
	}

	// Query active ads
	const now = new Date();
	const activeAds = await db.query.houseAds.findMany({
		where: and(
			eq(houseAds.placement, placement),
			eq(houseAds.status, "active"),
			lte(houseAds.startDate, now),
			gte(houseAds.endDate, now),
		),
	});

	if (activeAds.length === 0) {
		return {
			success: false,
			reason: "no-inventory",
		} satisfies HouseAdResponse;
	}

	// Apply targeting filters
	let filteredAds = activeAds;

	if (context?.category) {
		filteredAds = filteredAds.filter((ad) => {
			if (!ad.targetCategories || ad.targetCategories.length === 0) {
				return true; // No targeting = show to all
			}
			return ad.targetCategories.includes(context.category as string);
		});
	}

	if (context?.page) {
		filteredAds = filteredAds.filter((ad) => {
			if (!ad.targetPages || ad.targetPages.length === 0) {
				return true; // No targeting = show to all
			}
			return ad.targetPages.includes(context.page as string);
		});
	}

	if (filteredAds.length === 0) {
		return {
			success: false,
			reason: "filtered",
		} satisfies HouseAdResponse;
	}

	// Weighted random selection
	const totalWeight = filteredAds.reduce(
		(sum, ad) => sum + (ad.weight || 1),
		0,
	);
	let random = Math.random() * totalWeight;

	let selectedAd = filteredAds[0];
	for (const ad of filteredAds) {
		random -= ad.weight || 1;
		if (random <= 0) {
			selectedAd = ad;
			break;
		}
	}

	// Increment impression count (fire-and-forget)
	db.update(houseAds)
		.set({ impressions: (selectedAd.impressions || 0) + 1 })
		.where(eq(houseAds.id, selectedAd.id))
		.execute()
		.catch((err) => {
			console.error("[House Ads] Failed to increment impression:", err);
		});

	// Return ad creative
	return {
		success: true,
		ad: {
			id: selectedAd.id,
			title: selectedAd.title,
			description: selectedAd.description,
			imageUrl: selectedAd.imageUrl || undefined,
			ctaText: selectedAd.ctaText,
			ctaUrl: selectedAd.ctaUrl,
			trackingId: selectedAd.id, // Use ad ID for tracking
		},
	} satisfies HouseAdResponse;
});
