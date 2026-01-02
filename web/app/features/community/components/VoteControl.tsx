import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useFetcher } from "react-router";
import { cn } from "~/shared/utils/cn";

interface VoteControlProps {
	id: string;
	type: "post" | "comment";
	currentScore: number;
	currentVote: number; // 1, -1, or 0
	size?: "sm" | "md";
	className?: string;
	horizontal?: boolean;
}

/**
 * VoteControl - Global Action Implemenation
 *
 * Uses React Router's useFetcher to submit to the global '/api/vote' action.
 * React Router AUTOMATICALLY revalidates all loaders on the page after a fetcher action completes.
 *
 * Flow:
 * 1. User clicks
 * 2. fetcher.submit() -> POST /api/vote
 * 3. Server updates DB (and trigger updates score)
 * 4. React Router revalidates loaders
 * 5. New props flow down with updated score/vote
 */
export function VoteControl({
	id,
	type,
	currentScore,
	currentVote,
	size = "md",
	className,
	horizontal,
}: VoteControlProps) {
	// Use fetcher to hit the global API route
	const fetcher = useFetcher({ key: `vote-${id}` });

	// Check submitting state
	const isSubmitting = fetcher.state !== "idle";

	// Optimistic UI (optional, but good for responsiveness)
	// We can rely on props for the source of truth, but use formData for immediate feedback
	const optimisticVote = isSubmitting
		? Number.parseInt(fetcher.formData?.get("value") as string, 10)
		: currentVote;

	// Simple check: is user seemingly upvoted/downvoted right now?
	const isUpvoted = optimisticVote === 1;
	const isDownvoted = optimisticVote === -1;

	return (
		<div
			className={cn(
				"flex flex-col items-center overflow-hidden bg-gray-50/50 backdrop-blur-sm",
				horizontal
					? "h-8 flex-row gap-0 rounded-full border border-gray-200/60 shadow-sm"
					: "w-11 rounded-xl border border-gray-100 bg-white py-1 shadow-sm",
				size === "sm" && !horizontal && "w-8",
				className,
			)}
		>
			{/* Upvote Button */}
			<fetcher.Form method="post" action="/api/vote" className="contents">
				<input type="hidden" name="id" value={id} />
				<input type="hidden" name="type" value={type} />
				<input type="hidden" name="value" value={isUpvoted ? "0" : "1"} />
				<button
					type="submit"
					// Enable clicking even if active (to toggle off)
					disabled={isSubmitting}
					className={cn(
						"flex items-center justify-center transition-all focus:outline-none focus:ring-0",
						horizontal
							? "h-full w-9 hover:bg-gray-100"
							: "h-7 w-full hover:bg-gray-50",
						isSubmitting && "cursor-not-allowed opacity-50",
						isUpvoted
							? "text-orange-600"
							: "text-gray-400 hover:text-orange-600",
					)}
					aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
					aria-pressed={isUpvoted}
					title={isUpvoted ? "Remove upvote" : "Upvote"}
				>
					<ThumbsUp
						className={cn(
							"transition-transform active:scale-90",
							// Adjusted sizes for Thumbs icon (slightly smaller than Arrows to look balanced)
							size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
							isUpvoted ? "fill-current" : "fill-transparent",
							"stroke-[2px]",
						)}
					/>
				</button>
			</fetcher.Form>

			{/* Score (Read-only) */}
			<span
				className={cn(
					"flex min-w-[1.5rem] cursor-default select-none items-center justify-center font-bold text-sm tabular-nums",
					horizontal ? "h-full px-1.5" : "w-full py-0",
					isUpvoted && "text-orange-600",
					isDownvoted && "text-blue-600",
					!isUpvoted && !isDownvoted && "text-gray-700",
				)}
			>
				{currentScore}
			</span>

			{/* Downvote Button */}
			<fetcher.Form method="post" action="/api/vote" className="contents">
				<input type="hidden" name="id" value={id} />
				<input type="hidden" name="type" value={type} />
				<input type="hidden" name="value" value={isDownvoted ? "0" : "-1"} />
				<button
					type="submit"
					// Enable clicking even if active (to toggle off)
					disabled={isSubmitting}
					className={cn(
						"flex items-center justify-center transition-all focus:outline-none focus:ring-0",
						horizontal
							? "h-full w-9 hover:bg-gray-100"
							: "h-7 w-full hover:bg-gray-50",
						isSubmitting && "cursor-not-allowed opacity-50",
						isDownvoted ? "text-blue-600" : "text-gray-400 hover:text-blue-600",
					)}
					aria-label={isDownvoted ? "Remove downvote" : "Downvote"}
					aria-pressed={isDownvoted}
					title={isDownvoted ? "Remove downvote" : "Downvote"}
				>
					<ThumbsDown
						className={cn(
							"transition-transform active:scale-90",
							size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
							isDownvoted ? "fill-current" : "fill-transparent",
							"stroke-[2px]",
						)}
					/>
				</button>
			</fetcher.Form>
		</div>
	);
}
