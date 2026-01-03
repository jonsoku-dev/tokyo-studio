import type { WidgetLayout } from "@itcom/db/schema";
import { Clock, Search, TrendingUp } from "lucide-react";
import type { WidgetData } from "../../types/widget-data.types";

interface QuickSearchWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Quick Search Widget (Phase 3C)
 * 빠른 검색 및 인기 키워드
 */
export default function QuickSearchWidget({
	size: _size,
	widgetData,
}: QuickSearchWidgetProps) {
	const { recentSearches, popularSearches } = widgetData.quickSearch;

	const handleSearch = (query: string) => {
		// TODO: 검색 페이지로 이동
		window.location.href = `/search?q=${encodeURIComponent(query)}`;
	};

	return (
		<div className="space-y-4">
			{/* 검색바 */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					const query = formData.get("query") as string;
					if (query) handleSearch(query);
				}}
				className="relative"
			>
				<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					name="query"
					placeholder="멘토, 커뮤니티, 공고 검색..."
					className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
				/>
			</form>

			{/* 인기 검색어 (Standard/Expanded) */}
			{_size !== "compact" && popularSearches.length > 0 && (
				<div>
					<p className="mb-2 flex items-center gap-1 text-gray-500 text-xs">
						<TrendingUp className="h-3 w-3" />
						인기 검색어
					</p>
					<div className="flex flex-wrap gap-2">
						{popularSearches.map((keyword) => (
							<button
								key={keyword}
								type="button"
								onClick={() => handleSearch(keyword)}
								className="rounded-full bg-primary-100 px-3 py-1 text-primary-700 text-sm transition-colors hover:bg-primary-200"
							>
								{keyword}
							</button>
						))}
					</div>
				</div>
			)}

			{/* 최근 검색 (Expanded) */}
			{_size === "expanded" && recentSearches.length > 0 && (
				<div>
					<p className="mb-2 flex items-center gap-1 text-gray-500 text-xs">
						<Clock className="h-3 w-3" />
						최근 검색
					</p>
					<div className="space-y-1">
						{recentSearches.slice(0, 3).map((keyword) => (
							<button
								key={keyword}
								type="button"
								onClick={() => handleSearch(keyword)}
								className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-gray-600 text-sm transition-colors hover:bg-gray-50"
							>
								<Clock className="h-3 w-3 text-gray-400" />
								{keyword}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
