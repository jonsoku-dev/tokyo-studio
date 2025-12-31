import { useCallback, useState } from "react";
import type { MapLocationData } from "../store/map.store";
import { useMapStore } from "../store/map.store";
import { useUser } from "~/features/auth/hooks/useUser";

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
export function LocationPopup({
	location,
	onClose,
}: LocationPopupProps) {
	if (!location) return null;

	const categoryName =
		CATEGORY_NAMES[location.category as keyof typeof CATEGORY_NAMES]?.en ||
		location.category;

	// 길안내 열기 (Google Maps)
	const handleGetDirections = useCallback(() => {
		const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=transit`;
		window.open(url, "_blank");
	}, [location.latitude, location.longitude]);

	// 주소 복사
	const handleCopyAddress = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(location.address);
			alert("주소가 복사되었습니다");
		} catch {
			alert("복사 실패");
		}
	}, [location.address]);

	return (
		<div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-lg shadow-lg p-4 sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:rounded-lg">
			{/* 닫기 버튼 */}
			<button
				onClick={onClose}
				className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
			>
				✕
			</button>

			{/* 카테고리 배지 */}
			<div className="mb-2 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
				{categoryName}
			</div>

			{/* 위치명 (다국어) */}
			<div className="mb-4">
				<h2 className="text-lg font-bold text-gray-900">{location.nameEn}</h2>
				<p className="text-sm text-gray-600">{location.nameJa}</p>
				<p className="text-sm text-gray-600">{location.nameKo}</p>
			</div>

			{/* 상세 정보 */}
			<div className="space-y-2 text-sm mb-4">
				{/* 주소 */}
				<div className="flex items-start gap-2">
					<span className="text-gray-500 w-12">📍</span>
					<div className="flex-1">
						<p className="text-gray-900 break-words">{location.address}</p>
						<button
							onClick={handleCopyAddress}
							className="text-blue-600 hover:text-blue-800 text-xs mt-1"
						>
							복사
						</button>
					</div>
				</div>

				{/* 전화 */}
				{location.phone && (
					<div className="flex items-center gap-2">
						<span className="text-gray-500 w-12">📞</span>
						<a
							href={`tel:${location.phone}`}
							className="text-blue-600 hover:text-blue-800"
						>
							{location.phone}
						</a>
					</div>
				)}

				{/* 시간 */}
				{location.hours && (
					<div className="flex items-center gap-2">
						<span className="text-gray-500 w-12">🕐</span>
						<p className="text-gray-900">{location.hours}</p>
					</div>
				)}

				{/* 최근역 */}
				{location.station && (
					<div className="flex items-center gap-2">
						<span className="text-gray-500 w-12">🚇</span>
						<p className="text-gray-900">{location.station}</p>
					</div>
				)}
			</div>

			{/* 액션 버튼 */}
			<div className="flex gap-2">
				<button
					onClick={handleGetDirections}
					className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm font-medium transition"
				>
					길안내
				</button>
				<button
					onClick={onClose}
					className="flex-1 bg-gray-200 text-gray-900 py-2 px-3 rounded hover:bg-gray-300 text-sm font-medium transition"
				>
					닫기
				</button>
			</div>
		</div>
	);
}
