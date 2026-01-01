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
			<div className="stack-sm animate-pulse">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton loader
						key={i}
						className="h-10 rounded-md bg-gray-200 dark:bg-gray-700"
					/>
				))}
			</div>
		);
	}

	if (error || topics.length === 0) {
		return null;
	}

	return (
		<div className="stack-sm">
			<div className="mb-3 flex items-center gap-2">
				<TrendingUp className="h-5 w-5 text-primary-500" />
				<h3 className="font-semibold text-sm">Trending Topics</h3>
			</div>

			<ul className="stack-sm">
				{topics.map((topic) => (
					<li key={topic.query}>
						<button
							type="button"
							onClick={() => onSelectTopic?.(topic.query)}
							className="group w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<div className="flex items-center justify-between">
								<div className="flex min-w-0 flex-1 items-center gap-2">
									<Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
									<span className="truncate font-medium text-sm group-hover:text-primary-600">
										{topic.query}
									</span>
								</div>

								{topic.trending && (
									<span className="ml-2 flex-shrink-0 rounded-full bg-primary-100 px-2 py-1 text-primary-700 text-xs">
										↑ Trending
									</span>
								)}
							</div>

							<div className="caption ml-6">
								{topic.searches} searches • {topic.resultCount} results
							</div>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
