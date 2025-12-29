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
 * Hook to fetch and cache roadmap data
 *
 * Uses SSR loader data as initial cache value to avoid refetching
 * Will only refetch if explicitly invalidated
 */
export function useRoadmapQuery(initialData: RoadmapWithTasks) {
	return useQuery({
		queryKey: roadmapQueryKeys.all,
		queryFn: async () => {
			// Since this is SSR data from loader, just return initial data
			// Data is refreshed via mutation invalidation
			return initialData;
		},
		initialData,
		staleTime: Infinity, // Don't refetch until explicitly invalidated
		gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
	});
}
