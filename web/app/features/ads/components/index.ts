// ============================================================================
// Entry Point
// ============================================================================

export { AdSlot } from "./AdSlot";

// ============================================================================
// Core Components
// ============================================================================

export { AdCardCore } from "./core/AdCardCore";

// ============================================================================
// Providers (for advanced usage)
// ============================================================================

export { GoogleAdCard } from "./providers/GoogleAdCard";
export { HouseAdCard } from "./providers/HouseAdCard";

// ============================================================================
// Types
// ============================================================================

export type {
	AdCardCoreProps,
	AdSlotProps,
	ConsentState,
	GoogleAdCardProps,
	HouseAdCardProps,
	HouseAdContext,
	HouseAdCreative,
	HouseAdRequest,
	HouseAdResponse,
	LayoutPreset,
} from "./types";

export { ALLOWED_GOOGLE_LABELS } from "./types";
