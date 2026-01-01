"use client";

import { useCallback, useEffect, useState } from "react";
import { type MapLocationData, useMapStore } from "../store/map.store";
import { LocationPopup } from "./LocationPopup";
import MapComponent from "./Map.client";
import MapControls from "./MapControls.client";

/**
 * 지도 페이지 메인 컴포넌트
 * - useEffect 최소화
 * - 단방향 데이터 흐름
 * - Zustand 상태로 필터/검색 관리
 */
export function MapPage() {
	const {
		locations,
		isLoading,
		error,
		setLocations,
		setLoading,
		setError,
		selectedLocationId,
		setSelectedLocationId,
		searchQuery,
		getSelectedCategories,
	} = useMapStore();

	const [filteredLocations, setFilteredLocations] =
		useState<MapLocationData[]>(locations);
	const selectedLocation =
		locations.find((loc) => loc.id === selectedLocationId) || null;

	// 데이터 로드 (마운트 시 1회)
	useEffect(() => {
		const loadLocations = async () => {
			setLoading(true);
			try {
				const response = await fetch("/api/map");
				const data = await response.json();

				if (response.ok) {
					// numeric 타입을 number로 변환
					const converted = (data.locations || []).map((loc: any) => ({
						...loc,
						latitude: Number(loc.latitude),
						longitude: Number(loc.longitude),
					}));
					setLocations(converted);
				} else {
					setError(data.error || "위치 데이터 로드 실패");
				}
			} catch (err) {
				setError("네트워크 오류");
				console.error("[Map Page Error]", err);
			} finally {
				setLoading(false);
			}
		};

		loadLocations();
	}, [setError, setLoading, setLocations]); // 빈 의존성 배열: 마운트 시에만 1회 실행

	// 필터링 + 검색 실행
	const handleSearch = useCallback(
		async (query: string, categories: string[]) => {
			setLoading(true);
			try {
				const params = new URLSearchParams();
				if (query) params.append("search", query);
				for (const cat of categories) {
					params.append("categories", cat);
				}

				const response = await fetch(`/api/map?${params}`);
				const data = await response.json();

				if (response.ok) {
					const converted = (data.locations || []).map((loc: any) => ({
						...loc,
						latitude: Number(loc.latitude),
						longitude: Number(loc.longitude),
					}));
					setFilteredLocations(converted);
				}
			} catch (err) {
				console.error("[Search Error]", err);
			} finally {
				setLoading(false);
			}
		},
		[setLoading],
	);

	// 페이지별 필터링 적용 함수 호출
	useEffect(() => {
		// 클라이언트 사이드 필터링도 적용
		let filtered = locations;

		const categories = getSelectedCategories();
		if (categories.length > 0) {
			filtered = filtered.filter((loc) => categories.includes(loc.category));
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(loc) =>
					loc.nameEn.toLowerCase().includes(query) ||
					loc.nameJa.toLowerCase().includes(query) ||
					loc.nameKo.toLowerCase().includes(query) ||
					loc.address.toLowerCase().includes(query),
			);
		}

		setFilteredLocations(filtered);
	}, [locations, searchQuery, getSelectedCategories]);

	return (
		<div className="flex h-full flex-col gap-3">
			{/* 에러 메시지 */}
			{error && (
				<div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					{error}
				</div>
			)}

			{/* 검색/필터 컨트롤 */}
			<MapControls onSearch={handleSearch} isLoading={isLoading} />

			{/* 결과 개수 */}
			<div className="body-sm px-3">
				검색 결과: {filteredLocations.length}개
			</div>

			{/* 지도 */}
			<div className="min-h-0 flex-1">
				<MapComponent locations={filteredLocations} isLoading={isLoading} />
			</div>

			{/* 마커 정보 팝업 */}
			{selectedLocation && (
				<LocationPopup
					location={selectedLocation}
					onClose={() => setSelectedLocationId(null)}
				/>
			)}
		</div>
	);
}
