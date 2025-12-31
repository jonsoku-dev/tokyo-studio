/**
 * Custom hook for map search functionality
 * 단방향 설계: 검색 상태 관리 및 API 호출 분리
 */
import { useCallback } from "react";
import { useMapStore } from "../store/map.store";

interface UseMapSearchOptions {
	onSearchComplete?: () => void;
}

export function useMapSearch(options: UseMapSearchOptions = {}) {
	const {
		searchQuery,
		setSearchQuery,
		suggestions,
		setSuggestions,
		showSuggestions,
		setShowSuggestions,
	} = useMapStore();

	// 자동완성 제안 조회
	const fetchSuggestions = useCallback(
		async (query: string) => {
			if (query.length < 3) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/map?suggest=true&search=${encodeURIComponent(query)}`,
				);
				const data = await response.json();
				setSuggestions(data.suggestions || []);
				setShowSuggestions(true);
			} catch (error) {
				console.error("[Search] Error fetching suggestions:", error);
				setSuggestions([]);
			}
		},
		[setSuggestions, setShowSuggestions],
	);

	// 검색 입력 처리
	const handleInput = useCallback(
		async (value: string) => {
			setSearchQuery(value);
			await fetchSuggestions(value);
		},
		[setSearchQuery, fetchSuggestions],
	);

	// 제안 선택
	const handleSelectSuggestion = useCallback(
		(name: string) => {
			setSearchQuery(name);
			setShowSuggestions(false);
			options.onSearchComplete?.();
		},
		[setSearchQuery, setShowSuggestions, options],
	);

	// 검색 닫기
	const closeSuggestions = useCallback(() => {
		setShowSuggestions(false);
	}, [setShowSuggestions]);

	return {
		searchQuery,
		suggestions,
		showSuggestions,
		handleInput,
		handleSelectSuggestion,
		closeSuggestions,
	};
}
