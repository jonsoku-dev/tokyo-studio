/**
 * Custom hook for category filter functionality
 * 단방향 설계: 필터 상태 관리 분리
 */
import { useCallback } from "react";
import { useMapStore } from "../store/map.store";

export function useMapFilters() {
	const { selectedCategories, toggleCategory, clearCategories, setSearchQuery } =
		useMapStore();

	// 필터 초기화 (검색어 포함)
	const resetAll = useCallback(() => {
		clearCategories();
		setSearchQuery("");
	}, [clearCategories, setSearchQuery]);

	// 선택된 카테고리 배열로 변환
	const selectedArray = Array.from(selectedCategories);

	// 카테고리 선택 여부
	const isSelected = useCallback(
		(category: string) => selectedCategories.has(category),
		[selectedCategories],
	);

	return {
		selectedCategories: selectedArray,
		selectedSet: selectedCategories,
		toggleCategory,
		resetAll,
		isSelected,
		hasFilters: selectedCategories.size > 0,
	};
}
