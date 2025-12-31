import { useCallback, useEffect, useRef } from "react";
import { useMapStore } from "../store/map.store";

interface MapControlsProps {
	onSearch: (query: string, categories: string[]) => Promise<void>;
	isLoading?: boolean;
}

const CATEGORIES = [
	{ value: "government", label: "정부", emoji: "🏛️" },
	{ value: "immigration", label: "이민", emoji: "🛂" },
	{ value: "banking", label: "은행", emoji: "🏦" },
	{ value: "mobile", label: "이동통신", emoji: "📱" },
	{ value: "housing", label: "주택", emoji: "🏠" },
	{ value: "shopping", label: "쇼핑", emoji: "🛒" },
];

/**
 * 지도 필터/검색 UI
 * - 카테고리 필터 (복수 선택 가능)
 * - 검색 입력 + 자동완성
 * - 모바일 최적화 (하단 드로어)
 */
export function MapControls({ onSearch, isLoading }: MapControlsProps) {
	const {
		searchQuery,
		setSearchQuery,
		selectedCategories,
		toggleCategory,
		clearCategories,
		suggestions,
		setSuggestions,
		showSuggestions,
		setShowSuggestions,
	} = useMapStore();

	const searchInputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// 검색 입력 처리
	const handleSearchInput = useCallback(
		async (value: string) => {
			setSearchQuery(value);

			if (value.length >= 3) {
				// 서버에서 제안 조회
				try {
					const response = await fetch(
						`/api/map?suggest=true&search=${encodeURIComponent(value)}`,
					);
					const data = await response.json();
					setSuggestions(data.suggestions || []);
					setShowSuggestions(true);
				} catch (error) {
					console.error("[Search] Error fetching suggestions:", error);
				}
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		},
		[setSearchQuery, setSuggestions, setShowSuggestions],
	);

	// 제안 클릭
	const handleSuggestionClick = useCallback(
		async (_id: string, name: string) => {
			setSearchQuery(name);
			setShowSuggestions(false);

			// 검색 실행
			await onSearch(name, Array.from(selectedCategories));
		},
		[selectedCategories, setSearchQuery, setShowSuggestions, onSearch],
	);

	// 검색 실행
	const handleSearch = useCallback(async () => {
		await onSearch(searchQuery, Array.from(selectedCategories));
	}, [searchQuery, selectedCategories, onSearch]);

	// Enter 키 처리
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSearch();
				setShowSuggestions(false);
			} else if (e.key === "Escape") {
				setShowSuggestions(false);
			}
		},
		[handleSearch, setShowSuggestions],
	);

	// 외부 클릭 시 제안 닫기
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [setShowSuggestions]);

	return (
		<div className="flex flex-col gap-3 p-3 bg-white rounded-lg shadow-md">
			{/* 검색 입력 */}
			<div className="relative">
				<div className="flex gap-2">
					<div className="flex-1 relative">
						<input
							ref={searchInputRef}
							type="text"
							placeholder="위치 검색 (3자 이상)"
							value={searchQuery}
							onChange={(e) => handleSearchInput(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isLoading}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
						{isLoading && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={handleSearch}
						disabled={isLoading}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
					>
						검색
					</button>
				</div>

				{/* 자동완성 제안 */}
				{showSuggestions && suggestions.length > 0 && (
					<div
						ref={suggestionsRef}
						className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-10"
					>
						{suggestions.map((suggestion) => (
							<button
								type="button"
								key={suggestion.id}
								onClick={() =>
									handleSuggestionClick(suggestion.id, suggestion.name)
								}
								className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 transition"
							>
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500">
										{suggestion.category}
									</span>
									<span className="text-sm">{suggestion.name}</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* 카테고리 필터 */}
			<div className="flex flex-wrap gap-2">
				{CATEGORIES.map((category) => (
					<button
						type="button"
						key={category.value}
						onClick={() => toggleCategory(category.value)}
						className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition ${
							selectedCategories.has(category.value)
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						<span>{category.emoji}</span>
						<span>{category.label}</span>
					</button>
				))}
			</div>

			{/* 필터 초기화 */}
			{selectedCategories.size > 0 && (
				<button
					type="button"
					onClick={() => {
						clearCategories();
						setSearchQuery("");
					}}
					className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
				>
					필터 초기화
				</button>
			)}
		</div>
	);
}

export default MapControls;
