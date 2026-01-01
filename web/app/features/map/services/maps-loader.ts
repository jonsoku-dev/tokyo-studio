import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";

let loaderInstance: GoogleMapsLoader | null = null;
// biome-ignore lint/suspicious/noExplicitAny: Google Maps instance is untyped
let googleInstance: any = null;

/**
 * Google Maps API 로더
 * 싱글톤 패턴으로 단일 Loader 인스턴스 유지
 */
// biome-ignore lint/suspicious/noExplicitAny: Google Maps Loader returns any
export async function initGoogleMaps(): Promise<any> {
	if (googleInstance) {
		return googleInstance;
	}

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		throw new Error("VITE_GOOGLE_MAPS_API_KEY is not configured");
	}

	if (!loaderInstance) {
		loaderInstance = new GoogleMapsLoader({
			apiKey,
			version: "weekly",
			libraries: ["marker", "places"],
		});
	}

	try {
		// Loader가 스크립트를 로드하면 window.google이 설정됨
		// biome-ignore lint/suspicious/noExplicitAny: Google Maps Loader returns any
		const googleMaps = await (loaderInstance as any).load();
		googleInstance = googleMaps;
		return googleInstance;
	} catch (error) {
		console.error("[MapsLoader] Failed to load Google Maps:", error);
		throw error;
	}
}

/**
 * 이미 로드된 google 인스턴스 반환
 */
// biome-ignore lint/suspicious/noExplicitAny: Google Maps Loader returns any
export function getGoogleMaps(): any {
	if (!googleInstance) {
		throw new Error("Google Maps not loaded yet. Call initGoogleMaps first.");
	}
	return googleInstance;
}
