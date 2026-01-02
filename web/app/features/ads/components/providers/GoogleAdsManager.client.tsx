/**
 * Google Ads Manager - Client-only singleton for ad script management
 *
 * Responsibilities:
 * - Load Google Ads script once globally
 * - Prevent duplicate slot pushes
 * - Track pending slots for cleanup
 * - Handle route navigation cleanup
 *
 * @module GoogleAdsManager
 */

// Global state
let googleAdsScriptLoaded = false;
let scriptLoadingPromise: Promise<void> | null = null;
const pendingSlots = new Set<string>();

/**
 * Google Ads Script Configuration
 */
const GOOGLE_ADS_CONFIG = {
	scriptSrc: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
	timeout: 10000, // 10 seconds
} as const;

/**
 * Load Google Ads script (singleton)
 * Only loads once per session, subsequent calls return cached promise
 */
export async function loadGoogleAdsScript(): Promise<void> {
	// Return if already loaded
	if (googleAdsScriptLoaded) {
		return Promise.resolve();
	}

	// Return existing promise if loading
	if (scriptLoadingPromise) {
		return scriptLoadingPromise;
	}

	// Start loading
	scriptLoadingPromise = new Promise((resolve, reject) => {
		// Check if running in browser
		if (typeof window === "undefined") {
			reject(new Error("Cannot load Google Ads script in SSR environment"));
			return;
		}

		// Check if script already exists in DOM
		const existingScript = document.querySelector(
			`script[src="${GOOGLE_ADS_CONFIG.scriptSrc}"]`,
		);
		if (existingScript) {
			googleAdsScriptLoaded = true;
			resolve();
			return;
		}

		// Create script element
		const script = document.createElement("script");
		script.src = GOOGLE_ADS_CONFIG.scriptSrc;
		script.async = true;
		script.crossOrigin = "anonymous";

		// Setup timeout
		const timeout = setTimeout(() => {
			reject(new Error("Google Ads script loading timeout"));
		}, GOOGLE_ADS_CONFIG.timeout);

		// Success handler
		script.onload = () => {
			clearTimeout(timeout);
			googleAdsScriptLoaded = true;
			resolve();
		};

		// Error handler
		script.onerror = () => {
			clearTimeout(timeout);
			reject(new Error("Failed to load Google Ads script"));
		};

		// Append to document
		document.head.appendChild(script);
	});

	return scriptLoadingPromise;
}

/**
 * Push ad slot to Google Ads queue
 * Prevents duplicate pushes for the same slot
 *
 * @param slot - Ad unit ID
 * @returns true if push succeeded, false if already pending
 */
export function pushAdSlot(slot: string): boolean {
	// Check for duplicate
	if (pendingSlots.has(slot)) {
		if (process.env.NODE_ENV === "development") {
			console.warn(
				`[GoogleAdsManager] Ad slot "${slot}" already pushed. Skipping duplicate.`,
			);
		}
		return false;
	}

	// Check if script is loaded
	if (!googleAdsScriptLoaded) {
		if (process.env.NODE_ENV === "development") {
			console.warn(
				`[GoogleAdsManager] Attempting to push slot "${slot}" before script loaded`,
			);
		}
		return false;
	}

	// Check if adsbygoogle is available
	if (typeof window === "undefined" || !window.adsbygoogle) {
		if (process.env.NODE_ENV === "development") {
			console.warn(
				`[GoogleAdsManager] window.adsbygoogle not available for slot "${slot}"`,
			);
		}
		return false;
	}

	try {
		// Push to Google Ads queue
		window.adsbygoogle = window.adsbygoogle || [];
		window.adsbygoogle.push({});
		pendingSlots.add(slot);
		return true;
	} catch (error) {
		console.error(`[GoogleAdsManager] Failed to push slot "${slot}":`, error);
		return false;
	}
}

/**
 * Clear slot from pending set
 * Call this on component unmount or route navigation
 *
 * @param slot - Ad unit ID to clear
 */
export function clearSlot(slot: string): void {
	pendingSlots.delete(slot);
}

/**
 * Clear all pending slots
 * Useful for route navigation cleanup
 */
export function clearAllSlots(): void {
	pendingSlots.clear();
}

/**
 * Get current pending slots (for debugging)
 */
export function getPendingSlots(): string[] {
	return Array.from(pendingSlots);
}

/**
 * Check if script is loaded
 */
export function isScriptLoaded(): boolean {
	return googleAdsScriptLoaded;
}

/**
 * TypeScript declarations for window.adsbygoogle
 */
declare global {
	interface Window {
		adsbygoogle: Array<Record<string, unknown>>;
	}
}
