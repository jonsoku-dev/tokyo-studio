import type { WidgetLayout } from "@itcom/db/schema";
import { Building2, MapPin, Navigation } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface NearbyLocationsWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 카테고리별 스타일
const categoryStyles: Record<string, { color: string; label: string }> = {
	government: { color: "text-blue-600", label: "관공서" },
	immigration: { color: "text-purple-600", label: "입관" },
	banking: { color: "text-green-600", label: "은행" },
	mobile: { color: "text-orange-600", label: "통신사" },
	housing: { color: "text-red-600", label: "주거" },
	shopping: { color: "text-pink-600", label: "쇼핑" },
};

/**
 * Nearby Locations Widget (Phase 3B)
 * 즐겨찾기 장소 빠른 접근
 */
export default function NearbyLocationsWidget({
	size: _size,
	widgetData,
}: NearbyLocationsWidgetProps) {
	const { favorites } = widgetData.nearbyLocations;

	if (favorites.length === 0) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
					<MapPin className="h-7 w-7 text-primary-600" />
				</div>
				<div>
					<p className="font-medium text-gray-900">주변 장소</p>
					<p className="mt-1 text-gray-500 text-sm">
						자주 가는 장소를 즐겨찾기에 추가하세요
					</p>
				</div>
				<Link
					to="/map"
					className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary-700"
				>
					<Navigation className="h-4 w-4" />
					지도 열기
				</Link>
			</div>
		);
	}

	const maxItems = _size === "compact" ? 3 : 5;
	const displayFavorites = favorites.slice(0, maxItems);

	return (
		<div className="space-y-3">
			{/* 즐겨찾기 목록 */}
			{displayFavorites.map((location) => {
				const style = categoryStyles[location.category] || {
					color: "text-gray-600",
					label: location.category,
				};

				return (
					<Link
						key={location.id}
						to={`/map?focus=${location.id}`}
						className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
					>
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
							<Building2 className={`h-5 w-5 ${style.color}`} />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-gray-900 text-sm group-hover:text-primary-700">
								{location.name}
							</p>
							{location.address && _size !== "compact" && (
								<p className="truncate text-gray-500 text-xs">
									{location.address}
								</p>
							)}
						</div>
						<Navigation className="h-4 w-4 flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
					</Link>
				);
			})}

			{/* 지도 링크 */}
			<Link
				to="/map"
				className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 py-2 font-medium text-primary-600 text-sm transition-colors hover:bg-gray-100"
			>
				<MapPin className="h-4 w-4" />
				지도에서 더 찾아보기
			</Link>
		</div>
	);
}
