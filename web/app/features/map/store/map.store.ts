import { create } from "zustand";

export type MapLocationData = {
	id: string;
	category: string;
	nameEn: string;
	nameJa: string;
	nameKo: string;
	address: string;
	latitude: number;
	longitude: number;
	phone?: string;
	hours?: string;
	station?: string;
	area: string;
};

interface MapState {
	// 지도 상태
	locations: MapLocationData[];
	isLoading: boolean;
	error: string | null;

	// 필터 상태
	selectedCategories: Set<string>;
	searchQuery: string;
	suggestions: Array<{ id: string; name: string; category: string }>;
	showSuggestions: boolean;

	// 선택된 마커
	selectedLocationId: string | null;

	// 액션
	setLocations: (locations: MapLocationData[]) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// 필터 관련
	toggleCategory: (category: string) => void;
	clearCategories: () => void;
	setCategories: (categories: string[]) => void;

	// 검색 관련
	setSearchQuery: (query: string) => void;
	setSuggestions: (
		suggestions: Array<{ id: string; name: string; category: string }>,
	) => void;
	setShowSuggestions: (show: boolean) => void;

	// 마커 선택
	setSelectedLocationId: (id: string | null) => void;

	// 편의 함수
	getSelectedCategories: () => string[];
	hasActiveFilters: () => boolean;
	reset: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
	// 초기 상태
	locations: [],
	isLoading: false,
	error: null,
	selectedCategories: new Set<string>(),
	searchQuery: "",
	suggestions: [],
	showSuggestions: false,
	selectedLocationId: null,

	// 위치 데이터
	setLocations: (locations) => set({ locations, error: null }),
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),

	// 필터
	toggleCategory: (category) =>
		set((state) => {
			const newSet = new Set(state.selectedCategories);
			if (newSet.has(category)) {
				newSet.delete(category);
			} else {
				newSet.add(category);
			}
			return { selectedCategories: newSet };
		}),

	clearCategories: () => set({ selectedCategories: new Set() }),

	setCategories: (categories) =>
		set({ selectedCategories: new Set(categories) }),

	// 검색
	setSearchQuery: (query) => set({ searchQuery: query }),
	setSuggestions: (suggestions) => set({ suggestions }),
	setShowSuggestions: (show) => set({ showSuggestions: show }),

	// 마커 선택
	setSelectedLocationId: (id) => set({ selectedLocationId: id }),

	// 편의 함수
	getSelectedCategories: () => Array.from(get().selectedCategories),

	hasActiveFilters: () => {
		const state = get();
		return state.selectedCategories.size > 0 || state.searchQuery.length > 0;
	},

	reset: () =>
		set({
			selectedCategories: new Set(),
			searchQuery: "",
			suggestions: [],
			showSuggestions: false,
			selectedLocationId: null,
			error: null,
		}),
}));
