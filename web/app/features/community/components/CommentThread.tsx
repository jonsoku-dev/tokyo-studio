import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import type { CommentWithAuthor } from "../services/types";
import { CommentItem } from "./CommentItem";

interface CommentThreadProps {
	comments: CommentWithAuthor[];
	currentUserId?: string;
	postId: string;
}

export function CommentThread({
	comments,
	currentUserId,
	postId,
}: CommentThreadProps) {
	// Transform flat list to tree
	const rootComments = useMemo(() => {
		const map = new Map<string, CommentWithAuthor>();
		const roots: CommentWithAuthor[] = [];

		// First pass: map all
		for (const c of comments) {
			map.set(c.id, { ...c, children: [] });
		}

		// Second pass: attach to parents
		// Second pass: attach to parents
		for (const c of comments) {
			const node = map.get(c.id);
			if (!node) continue;

			if (c.parentId) {
				const parent = map.get(c.parentId);
				if (parent?.children) {
					parent.children.push(node);
				} else {
					// Fallback if parent missing or no children array (shouldn't happen)
					roots.push(node);
				}
			} else {
				roots.push(node);
			}
		}

		return roots;
	}, [comments]);

	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	return (
		<div className="space-y-8">
			{/* Root Comment Form */}
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
				<CommentForm postId={postId} />
			</div>

			{/* List */}
			<div className="space-y-6">
				{rootComments.length === 0 && (
					<div className="text-center text-gray-500 py-8">
						<MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
						No comments yet. Be the first to share your thoughts!
					</div>
				)}
				{rootComments.map((comment) => (
					<CommentNode
						key={comment.id}
						comment={comment}
						currentUserId={currentUserId}
						postId={postId}
						replyingTo={replyingTo}
						setReplyingTo={setReplyingTo}
					/>
				))}
			</div>
		</div>
	);
}

// Recursive Node
function CommentNode({
	comment,
	currentUserId,
	postId,
	replyingTo,
	setReplyingTo,
}: {
	comment: CommentWithAuthor;
	currentUserId?: string;
	postId: string;
	replyingTo: string | null;
	setReplyingTo: (id: string | null) => void;
}) {
	// SPEC 008: Show More Replies collapsing
	// Auto-expand if 3 or fewer replies, otherwise collapse
	const [showReplies, setShowReplies] = useState(
		!comment.children || comment.children.length <= 3,
	);
	const hasReplies = comment.children && comment.children.length > 0;
	const replyCount = comment.children?.length || 0;

	return (
		<div className="relative">
			<CommentItem
				comment={comment}
				currentUserId={currentUserId}
				onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
			/>

			{/* Reply Form */}
			{replyingTo === comment.id && (
				<div className="mt-2 ml-11">
					<CommentForm
						postId={postId}
						parentId={comment.id}
						onCancel={() => setReplyingTo(null)}
						autoFocus
					/>
				</div>
			)}

			{/* Show/Hide Replies Button (for threads with > 3 replies) */}
			{hasReplies && replyCount > 3 && (
				<button
					type="button"
					onClick={() => setShowReplies(!showReplies)}
					className="mt-2 ml-11 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
				>
					{showReplies ? (
						<>
							Hide {replyCount} replies
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Hide replies</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 15l7-7 7 7"
								/>
							</svg>
						</>
					) : (
						<>
							Show {replyCount} more {replyCount === 1 ? "reply" : "replies"}
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Show replies</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</>
					)}
				</button>
			)}

			{/* Children */}
			{hasReplies && showReplies && (
				<div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 space-y-3">
					{/* biome-ignore lint/suspicious/noExplicitAny: Recursive type structure difficult to type perfectly here */}
					{(comment as any).children.map((child: any) => (
						<CommentNode
							key={child.id}
							comment={child}
							currentUserId={currentUserId}
							postId={postId}
							replyingTo={replyingTo}
							setReplyingTo={setReplyingTo}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// Simple Form
function CommentForm({
	postId,
	parentId,
	onCancel,
	autoFocus,
}: {
	postId: string;
	parentId?: string;
	onCancel?: () => void;
	autoFocus?: boolean;
}) {
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state !== "idle";

	// Reset form after submission?
	// We can key the form or use useEffect.
	// Simpler: use key based on submitting state or manual clear.

	return (
		<fetcher.Form
			method="POST"
			action="/api/comments"
			className="space-y-3"
			ref={(form) => {
				// simple reset on success handling usually done via useEffect on fetcher.data
				if (fetcher.state === "idle" && fetcher.data?.success) {
					form?.reset();
					if (onCancel) onCancel();
				}
			}}
		>
			<input type="hidden" name="intent" value="create" />
			<input type="hidden" name="postId" value={postId} />
			{parentId && <input type="hidden" name="parentId" value={parentId} />}

			<textarea
				name="content"
				rows={parentId ? 2 : 3}
				placeholder={parentId ? "Write a reply..." : "What are your thoughts?"}
				className="w-full p-3 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
				required
				// biome-ignore lint/a11y/noAutofocus: Intentional for reply UX
				autoFocus={autoFocus}
			/>
			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				)}
				<Button type="submit" size="sm" disabled={isSubmitting}>
					{isSubmitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
