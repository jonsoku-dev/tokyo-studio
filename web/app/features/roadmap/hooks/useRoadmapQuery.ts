import { useQuery } from "@tanstack/react-query";
import type { RoadmapWithTasks } from "../services/roadmap.server";

/**
 * Query keys for roadmap operations
 * Used for cache invalidation and query identification
 */
export const roadmapQueryKeys = {
	all: ["roadmap"] as const,
	list: () => [...roadmapQueryKeys.all, "list"] as const,
};

/**
 * Fetch roadmap from server
 * Single source of truth - always fetches latest data from server
 */
async function fetchRoadmap(): Promise<RoadmapWithTasks> {
	const response = await fetch("/api/roadmap", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch roadmap");
	}

	return response.json();
}

/**
 * Hook to fetch and cache roadmap data
 *
 * Single direction data flow:
 * - Server is the source of truth
 * - Uses SSR loader data as initial cache to avoid waterfall requests
 * - After mutations, invalidation triggers fresh server fetch
 * - staleTime: 0 ensures fresh data on any invalidation
 */
export function useRoadmapQuery(initialData: RoadmapWithTasks) {
	return useQuery({
		queryKey: roadmapQueryKeys.all,
		queryFn: fetchRoadmap,
		initialData,
		staleTime: 0, // Always refetch when invalidated (server is source of truth)
		gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
	});
}
