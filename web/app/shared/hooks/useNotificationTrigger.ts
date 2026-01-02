import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { NotificationEvent } from "~/features/notifications/types";

/**
 * Hook for triggering notifications from React components
 * Provides a simple API to send notifications to the orchestrator
 */
export function useNotificationTrigger() {
	const fetcher = useFetcher<{ success: boolean; error?: string }>();

	const trigger = useCallback(
		(event: NotificationEvent) => {
			fetcher.submit(
				{ event: JSON.stringify(event) },
				{ method: "POST", action: "/api/notifications/trigger" },
			);
		},
		[fetcher],
	);

	return {
		trigger,
		state: fetcher.state, // "idle" | "submitting" | "loading"
		error: fetcher.data?.error,
		success: fetcher.data?.success,
	};
}
