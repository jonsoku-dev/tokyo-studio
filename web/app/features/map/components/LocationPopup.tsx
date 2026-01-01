import { useCallback } from "react";
import type { MapLocationData } from "../store/map.store";

interface LocationPopupProps {
	location: MapLocationData | null;
	onClose: () => void;
}

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
	government: { en: "Government", ja: "政府", ko: "정부" },
	immigration: { en: "Immigration", ja: "入国管理", ko: "이민" },
	banking: { en: "Banking", ja: "銀行", ko: "은행" },
	mobile: { en: "Mobile", ja: "携帯", ko: "이동통신" },
	housing: { en: "Housing", ja: "住宅", ko: "주택" },
	shopping: { en: "Shopping", ja: "買い物", ko: "쇼핑" },
};

/**
 * 마커 정보 팝업
 * - 다국어 지원 (영/일/한)
 * - 길안내 기능
 * - 주소 복사
 */
export function LocationPopup({ location, onClose }: LocationPopupProps) {
	// 길안내 열기 (Google Maps)
	const handleGetDirections = useCallback(() => {
		if (!location) return;
		const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=transit`;
		window.open(url, "_blank");
	}, [location]);

	// 주소 복사
	const handleCopyAddress = useCallback(async () => {
		if (!location) return;
		try {
			await navigator.clipboard.writeText(location.address);
			alert("주소가 복사되었습니다");
		} catch {
			alert("복사 실패");
		}
	}, [location]);

	if (!location) return null;

	const categoryName =
		CATEGORY_NAMES[location.category as keyof typeof CATEGORY_NAMES]?.en ||
		location.category;

	return (
		<div className="fixed right-0 bottom-0 left-0 mx-auto max-w-md rounded-t-lg bg-white p-4 shadow-lg sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:transform sm:rounded-lg">
			{/* 닫기 버튼 */}
			<button
				type="button"
				onClick={onClose}
				className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
			>
				✕
			</button>

			{/* 카테고리 배지 */}
			<div className="mb-2 inline-block rounded bg-primary-100 px-2 py-1 font-semibold text-primary-800 text-xs">
				{categoryName}
			</div>

			{/* 위치명 (다국어) */}
			<div className="mb-4">
				<h2 className="heading-5">{location.nameEn}</h2>
				<p className="body-sm">{location.nameJa}</p>
				<p className="body-sm">{location.nameKo}</p>
			</div>

			{/* 상세 정보 */}
			<div className="stack-sm mb-4 text-sm">
				{/* 주소 */}
				<div className="flex items-start gap-2">
					<span className="w-12 text-gray-500">📍</span>
					<div className="flex-1">
						<p className="break-words text-gray-900">{location.address}</p>
						<button
							type="button"
							onClick={handleCopyAddress}
							className="mt-1 text-primary-600 text-xs hover:text-primary-800"
						>
							복사
						</button>
					</div>
				</div>

				{/* 전화 */}
				{location.phone && (
					<div className="flex items-center gap-2">
						<span className="w-12 text-gray-500">📞</span>
						<a
							href={`tel:${location.phone}`}
							className="text-primary-600 hover:text-primary-800"
						>
							{location.phone}
						</a>
					</div>
				)}

				{/* 시간 */}
				{location.hours && (
					<div className="flex items-center gap-2">
						<span className="w-12 text-gray-500">🕐</span>
						<p className="text-gray-900">{location.hours}</p>
					</div>
				)}

				{/* 최근역 */}
				{location.station && (
					<div className="flex items-center gap-2">
						<span className="w-12 text-gray-500">🚇</span>
						<p className="text-gray-900">{location.station}</p>
					</div>
				)}
			</div>

			{/* 액션 버튼 */}
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleGetDirections}
					className="flex-1 rounded bg-primary-600 px-3 py-2 font-medium text-sm text-white transition hover:bg-primary-700"
				>
					길안내
				</button>
				<button
					type="button"
					onClick={onClose}
					className="flex-1 rounded bg-gray-200 px-3 py-2 font-medium text-gray-900 text-sm transition hover:bg-gray-300"
				>
					닫기
				</button>
			</div>
		</div>
	);
}
