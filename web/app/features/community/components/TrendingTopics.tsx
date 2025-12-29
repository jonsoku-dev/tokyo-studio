import { Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { TrendingTopic } from "../services/search-analytics.server";

interface TrendingTopicsProps {
	onSelectTopic?: (query: string) => void;
	limit?: number;
}

export function TrendingTopics({
	onSelectTopic,
	limit = 5,
}: TrendingTopicsProps) {
	const [topics, setTopics] = useState<TrendingTopic[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTrendingTopics = async () => {
			try {
				const response = await fetch(
					`/api/community/trending-topics?limit=${limit}`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch trending topics");
				}

				const data = await response.json();
				setTopics(data.topics || []);
			} catch (err) {
				console.error("Error fetching trending topics:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load trending topics",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchTrendingTopics();
	}, [limit]);

	if (loading) {
		return (
			<div className="animate-pulse space-y-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="h-10 bg-gray-200 rounded-md dark:bg-gray-700"
					/>
				))}
			</div>
		);
	}

	if (error || topics.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 mb-3">
				<TrendingUp className="h-5 w-5 text-orange-500" />
				<h3 className="font-semibold text-sm">Trending Topics</h3>
			</div>

			<ul className="space-y-2">
				{topics.map((topic) => (
					<li key={topic.query}>
						<button
							onClick={() => onSelectTopic?.(topic.query)}
							className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
									<span className="text-sm font-medium truncate group-hover:text-blue-600">
										{topic.query}
									</span>
								</div>

								{topic.trending && (
									<span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
										↑ Trending
									</span>
								)}
							</div>

							<div className="text-xs text-gray-500 ml-6">
								{topic.searches} searches • {topic.resultCount} results
							</div>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
