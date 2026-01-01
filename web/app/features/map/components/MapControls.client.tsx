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
		<div className="card-md flex flex-col gap-3 p-3">
			{/* 검색 입력 */}
			<div className="relative">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<input
							ref={searchInputRef}
							type="text"
							placeholder="위치 검색 (3자 이상)"
							value={searchQuery}
							onChange={(e) => handleSearchInput(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isLoading}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
						/>
						{isLoading && (
							<div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={handleSearch}
						disabled={isLoading}
						className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-sm text-white transition hover:bg-primary-700 disabled:bg-gray-400"
					>
						검색
					</button>
				</div>

				{/* 자동완성 제안 */}
				{showSuggestions && suggestions.length > 0 && (
					<div
						ref={suggestionsRef}
						className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-md"
					>
						{suggestions.map((suggestion) => (
							<button
								type="button"
								key={suggestion.id}
								onClick={() =>
									handleSuggestionClick(suggestion.id, suggestion.name)
								}
								className="w-full border-b px-3 py-2 text-left transition last:border-b-0 hover:bg-gray-100"
							>
								<div className="flex items-center gap-2">
									<span className="caption">{suggestion.category}</span>
									<span className="text-sm">{suggestion.name}</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* 카테고리 필터 */}
			<div className="cluster-sm">
				{CATEGORIES.map((category) => (
					<button
						type="button"
						key={category.value}
						onClick={() => toggleCategory(category.value)}
						className={`flex items-center gap-1 rounded-full px-3 py-2 font-medium text-sm transition ${
							selectedCategories.has(category.value)
								? "bg-primary-600 text-white"
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
					className="body-sm rounded px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900"
				>
					필터 초기화
				</button>
			)}
		</div>
	);
}

export default MapControls;
