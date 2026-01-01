import { useEffect, useRef } from "react";
import { getGoogleMaps, initGoogleMaps } from "../services/maps-loader";
import { type MapLocationData, useMapStore } from "../store/map.store";

interface MapProps {
	locations: MapLocationData[];
	isLoading?: boolean;
}

const CATEGORY_COLORS: Record<string, { icon: string; color: string }> = {
	government: { icon: "🏛️", color: "#3B82F6" },
	immigration: { icon: "🛂", color: "#EF4444" },
	banking: { icon: "🏦", color: "#10B981" },
	mobile: { icon: "📱", color: "#A855F7" },
	housing: { icon: "🏠", color: "#F97316" },
	shopping: { icon: "🛒", color: "#FBBF24" },
};

const TOKYO_CENTER = {
	lat: 35.6762,
	lng: 139.6503,
};

/**
 * 대화형 지도 컴포넌트
 * - Google Maps API 사용 (@googlemaps/js-api-loader)
 * - 마커 표시
 * - 필터링된 위치 표시
 */
export function MapComponent({ locations, isLoading }: MapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	// biome-ignore lint/suspicious/noExplicitAny: Google Maps types require @types/google.maps
	const googleMapRef = useRef<any>(null);
	// biome-ignore lint/suspicious/noExplicitAny: Google Maps Marker type
	const markersRef = useRef<Map<string, any>>(new Map());
	const isInitializedRef = useRef(false);

	const { selectedLocationId, setSelectedLocationId } = useMapStore();

	// 지도 초기화 (1회만 실행)
	useEffect(() => {
		if (isInitializedRef.current || !mapRef.current) return;

		const initializeMap = async () => {
			try {
				const google = await initGoogleMaps();

				if (!mapRef.current) return;

				const map = new google.maps.Map(mapRef.current, {
					zoom: 13,
					center: TOKYO_CENTER,
					mapTypeControl: true,
					fullscreenControl: true,
					zoomControl: true,
					streetViewControl: false,
				});

				googleMapRef.current = map;
				isInitializedRef.current = true;
			} catch (error) {
				console.error("[Map] Failed to initialize Google Maps:", error);
			}
		};

		initializeMap();
	}, []);

	// 마커 업데이트
	useEffect(() => {
		if (!googleMapRef.current || isLoading) return;

		try {
			const google = getGoogleMaps();
			const map = googleMapRef.current;

			// 기존 마커 제거
			markersRef.current.forEach((marker) => {
				marker.setMap(null);
			});
			markersRef.current.clear();

			// 필터된 위치에 대한 새 마커 생성
			locations.forEach((location) => {
				const color =
					CATEGORY_COLORS[location.category as keyof typeof CATEGORY_COLORS];
				const icon = color?.icon || "📍";

				const marker = new google.maps.Marker({
					position: {
						lat: Number(location.latitude),
						lng: Number(location.longitude),
					},
					map,
					title: location.nameEn,
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						scale: 12,
						fillColor: color?.color || "#6B7280",
						fillOpacity: 0.9,
						strokeColor: "white",
						strokeWeight: 2,
					},
					label: {
						text: icon,
						fontSize: "16px",
						fontWeight: "bold",
					},
				});

				// 클릭 이벤트
				marker.addListener("click", () => {
					setSelectedLocationId(location.id);
					const position = marker.getPosition();
					if (position) {
						map.panTo(position);
					}
					map.setZoom(15);
				});

				markersRef.current.set(location.id, marker);
			});

			// 모든 마커를 포함하도록 지도 범위 조정
			if (locations.length > 0) {
				const bounds = new google.maps.LatLngBounds();
				locations.forEach((location) => {
					bounds.extend({
						lat: Number(location.latitude),
						lng: Number(location.longitude),
					});
				});
				map.fitBounds(bounds, 50);
			} else {
				map.setCenter(TOKYO_CENTER);
				map.setZoom(13);
			}
		} catch (error) {
			console.error("[Map] Failed to update markers:", error);
		}
	}, [locations, isLoading, setSelectedLocationId]);

	// 선택된 마커 강조 표시
	useEffect(() => {
		if (!selectedLocationId) return;

		try {
			const google = getGoogleMaps();
			const marker = markersRef.current.get(selectedLocationId);

			if (marker) {
				marker.setAnimation(google.maps.Animation.BOUNCE);

				const timer = setTimeout(() => {
					marker.setAnimation(null);
				}, 3000);

				return () => clearTimeout(timer);
			}
		} catch (error) {
			console.error("[Map] Failed to highlight marker:", error);
		}
	}, [selectedLocationId]);

	return (
		<div className="relative h-full w-full">
			<div
				ref={mapRef}
				className="h-full w-full rounded-lg bg-gray-100"
				style={{ minHeight: "500px" }}
			/>

			{isLoading && (
				<div className="absolute inset-0 center bg-white/50 rounded-lg">
					<div className="text-center">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
						<p className="mt-2 body-sm">지도 로딩 중...</p>
					</div>
				</div>
			)}

			{!isLoading && locations.length === 0 && (
				<div className="absolute inset-0 center bg-white/50 rounded-lg">
					<p className="text-gray-500">검색 결과가 없습니다</p>
				</div>
			)}
		</div>
	);
}

export default MapComponent;
