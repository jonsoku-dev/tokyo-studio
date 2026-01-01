import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { cn } from "~/shared/utils/cn";

interface VoteControlProps {
	id: string;
	type: "post" | "comment";
	initialScore: number;
	initialVote?: number; // 1, -1, 0/undefined
	size?: "sm" | "md";
	className?: string;
}

export function VoteControl({
	id,
	type,
	initialScore,
	initialVote = 0,
	size = "md",
	className,
}: VoteControlProps) {
	const fetcher = useFetcher<{ success: boolean; score?: number }>();
	const [vote, setVote] = useState(initialVote);
	const [score, setScore] = useState(initialScore);

	// Optimistic update logic
	const handleVote = (value: number) => {
		const newVote = vote === value ? 0 : value;

		// Calculate score diff
		// If removing vote (newVote 0) -> subtract old vote
		// If changing vote -> subtract old, add new
		// If adding vote -> add new
		let scoreDiff = 0;
		if (newVote === 0) {
			scoreDiff = -vote;
		} else {
			scoreDiff = newVote - vote;
		}

		setVote(newVote);
		setScore((prev) => prev + scoreDiff);

		fetcher.submit(
			{ type, id, value: newVote.toString() },
			{ method: "post", action: "/api/vote" },
		);
	};

	// Sync with server response if needed (optional, assuming event consistency)
	// But usually validation might fail.
	// If fetcher catches error, we should revert.
	// For MVP simple optimistic is okay.

	const isUpvoted = vote === 1;
	const isDownvoted = vote === -1;

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-1",
				size === "sm" && "flex-row bg-transparent p-0 gap-2",
				className,
			)}
		>
			<button
				type="button"
				onClick={() => handleVote(1)}
				className={cn(
					"p-1 rounded hover:bg-gray-200 transition-colors",
					isUpvoted && "text-primary-500 hover:bg-primary-100",
				)}
				aria-label="Upvote"
			>
				<ArrowUp className={cn("w-6 h-6", size === "sm" && "w-4 h-4")} />
			</button>

			<span
				className={cn(
					"font-bold text-sm",
					isUpvoted && "text-primary-500",
					isDownvoted && "text-primary-500",
				)}
			>
				{score}
			</span>

			<button
				type="button"
				onClick={() => handleVote(-1)}
				className={cn(
					"p-1 rounded hover:bg-gray-200 transition-colors",
					isDownvoted && "text-primary-500 hover:bg-primary-100",
				)}
				aria-label="Downvote"
			>
				<ArrowDown className={cn("w-6 h-6", size === "sm" && "w-4 h-4")} />
			</button>
		</div>
	);
}
