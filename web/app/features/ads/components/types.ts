import type { ReactNode } from "react";

// ============================================================================
// Layout & Display Types
// ============================================================================

export type LayoutPreset = "sidebar" | "feed" | "inline";

export type ConsentState = "granted" | "denied" | "unknown";

// ============================================================================
// Core Component Props
// ============================================================================

export interface AdCardCoreProps {
	// Visual Structure
	label: string; // Required: "Advertisements" | "Sponsored" | "Ad"
	title?: string;
	rightAction?: ReactNode;

	// Layout
	layout: LayoutPreset;
	minHeight?: string; // CLS prevention

	// Content
	children: ReactNode;
	footer?: ReactNode;

	// Safety
	allowInOverlay?: boolean; // Default: false
	className?: string;
}

// ============================================================================
// Google Ads Provider
// ============================================================================

export const ALLOWED_GOOGLE_LABELS = [
	"Advertisements",
	"Sponsored Links",
] as const;

export type GoogleAdLabel = (typeof ALLOWED_GOOGLE_LABELS)[number];

export interface GoogleAdCardProps {
	slot: string; // Google Ad Unit ID
	layout: LayoutPreset;
	consentState?: ConsentState;
	fallback?: ReactNode;
	onLoad?: () => void;
	onError?: (error: Error) => void;
}

// ============================================================================
// House Ads Provider
// ============================================================================

export interface HouseAdContext {
	category?: string; // 'frontend', 'backend', 'infrastructure'
	page?: string; // 'dashboard', 'pipeline', 'community'
	userId?: string; // For targeting
}

export interface HouseAdCardProps {
	placement: string; // 'sidebar', 'feed-top', 'feed-middle', 'inline'
	layout: LayoutPreset;
	/**
	 * Pre-fetched ad data from server loader (SSR-first approach).
	 * When provided, skips client-side fetching entirely.
	 */
	ad?: HouseAdCreative | null;
	/**
	 * @deprecated Use `ad` prop with server-side data fetching instead.
	 * Context for client-side fetching (legacy).
	 */
	context?: HouseAdContext;
	fallback?: ReactNode;
	onLoad?: () => void;
	onError?: (error: Error) => void;
}

// ============================================================================
// House Ads API Types
// ============================================================================

export interface HouseAdRequest {
	placement: string;
	context?: HouseAdContext;
}

export interface HouseAdCreative {
	id: string;
	title: string;
	description: string;
	imageUrl?: string;
	ctaText: string;
	ctaUrl: string;
	trackingId: string; // For click/impression tracking
}

export interface HouseAdResponse {
	success: boolean;
	ad?: HouseAdCreative;
	reason?: "no-inventory" | "filtered" | "frequency-capped";
}

// ============================================================================
// AdSlot Entry Point (Discriminated Union)
// ============================================================================

export type AdSlotProps =
	| {
			provider: "google";
			slot: string;
			layout: LayoutPreset;
			consentState?: ConsentState;
			fallback?: ReactNode;
	  }
	| {
			provider: "house";
			placement: string;
			layout: LayoutPreset;
			/**
			 * Pre-fetched ad data from server loader (SSR-first approach).
			 * When provided, skips client-side fetching entirely.
			 */
			ad?: HouseAdCreative | null;
			/**
			 * @deprecated Use `ad` prop with server-side data fetching instead.
			 */
			context?: HouseAdContext;
			fallback?: ReactNode;
	  };
