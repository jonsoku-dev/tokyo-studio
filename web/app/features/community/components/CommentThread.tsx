import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Button } from "~/shared/components/ui/Button";
import type { CommentWithAuthor } from "../services/types";
import { CommentItem } from "./CommentItem";

interface CommentThreadProps {
	initialComments: CommentWithAuthor[];
	initialNextCursor: string | null;
	currentUserId?: string;
	postId: string;
	sort: "best" | "oldest" | "newest";
}

export function CommentThread({
	initialComments,
	initialNextCursor,
	currentUserId,
	postId,
	sort,
}: CommentThreadProps) {
	// Top-level comments state
	const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
	const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);

	// Fetcher for loading more top-level comments
	const fetcher = useFetcher<{ comments: CommentWithAuthor[]; nextCursor: string | null }>();

	const handleLoadMore = () => {
		if (!nextCursor) return;
		const params = new URLSearchParams({
			postId,
			sort,
			cursor: nextCursor,
			limit: "5",
		});
		fetcher.load(`/api/comments/list?${params.toString()}`);
	};

	useEffect(() => {
		if (fetcher.data) {
			setComments((prev) => {
				const newComments = fetcher.data?.comments || [];
				// Deduplicate to prevent key collision error
				const uniqueNew = newComments.filter(
					(n) => !prev.some((p) => p.id === n.id),
				);
				return [...prev, ...uniqueNew];
			});
			setNextCursor(fetcher.data.nextCursor);
		}
	}, [fetcher.data]);

	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	return (
		<div className="stack-lg">
			{/* Root Comment Form */}
			<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
				<CommentForm postId={postId} />
			</div>

			{/* List */}
			<div className="stack-md">
				{comments.length === 0 && (
					<div className="py-8 text-center text-gray-500">
						<MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
						아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
					</div>
				)}
				{comments.map((comment) => (
					<CommentNode
						key={comment.id}
						comment={comment}
						currentUserId={currentUserId}
						postId={postId}
						replyingTo={replyingTo}
						setReplyingTo={setReplyingTo}
						sort={sort}
					/>
				))}

				{/* Load More Button */}
				{nextCursor && (
					<div className="text-center pt-2">
						<Button
							variant="outline"
							onClick={handleLoadMore}
							disabled={fetcher.state === "loading"}
						>
							{fetcher.state === "loading" ? "로딩 중..." : "댓글 더 불러오기"}
						</Button>
					</div>
				)}
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
	sort,
}: {
	comment: CommentWithAuthor;
	currentUserId?: string;
	postId: string;
	replyingTo: string | null;
	setReplyingTo: (id: string | null) => void;
	sort: string;
}) {
	// Local state for replies (children)
	const [children, setChildren] = useState<CommentWithAuthor[]>(comment.children || []);
	const [nextCursor, setNextCursor] = useState<string | null>(null); // We need to returned initial cursor if we preloaded children? 
	// Actually current loader ONLY returns top level. So initial children is empty.
	// But replyCount > 0.

	const replyCount = comment.replyCount || 0;
	// If 0 replies, showReplies is false.
	// If > 0, user must click "Show Replies". 
	// Or we could auto-fetch for first few?
	// User Requirement: "Show More Button".
	// Let's default to collapsed (or auto-fetch if we implemented that, but we didn't).
	// So we show "Show X Replies".
	const [showReplies, setShowReplies] = useState(false);
	
	const fetcher = useFetcher<{ comments: CommentWithAuthor[]; nextCursor: string | null }>();

	const handleLoadReplies = () => {
		const cursor = nextCursor; 
		const params = new URLSearchParams({
			postId,
			parentId: comment.id,
			sort: sort, // Keep sort consistent
			limit: "5",
		});
		if (cursor) params.set("cursor", cursor);
		
		fetcher.load(`/api/comments/list?${params.toString()}`);
	};

	useEffect(() => {
		if (fetcher.data) {
			setChildren((prev) => {
				const newComments = fetcher.data?.comments || [];
				// Deduplicate
				const uniqueNew = newComments.filter(
					(n) => !prev.some((p) => p.id === n.id),
				);
				return [...prev, ...uniqueNew];
			});
			setNextCursor(fetcher.data.nextCursor);
		}
	}, [fetcher.data]);

	const toggleReplies = () => {
		if (!showReplies) {
			setShowReplies(true);
			// If no children loaded yet, load them!
			if (children.length === 0 && replyCount > 0) {
				handleLoadReplies();
			}
		} else {
			setShowReplies(false);
		}
	};

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

			{/* Smart Reply Toggle Button */}
			{replyCount > 0 && (
				<button
					type="button"
					onClick={toggleReplies}
					className="mt-2 ml-11 flex items-center gap-1 font-medium text-primary-600 text-sm transition-colors hover:text-primary-700"
				>
					{showReplies ? (
						<>
							답글 숨기기
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Hide reply thread</title>
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
							답글 {replyCount}개 보기
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Show reply thread</title>
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

			{/* Children List */}
			{showReplies && (
				<div className="stack-sm mt-3 ml-4 border-gray-100 border-l-2 pl-4">
					{children.map((child) => (
						<CommentNode
							key={child.id}
							comment={child}
							currentUserId={currentUserId}
							postId={postId}
							replyingTo={replyingTo}
							setReplyingTo={setReplyingTo}
							sort={sort}
						/>
					))}
					
					{/* Load More Replies Button */}
					{/* If we have children but also nextCursor, show "Load More" */}
					{(nextCursor || (fetcher.state === "loading" && children.length > 0)) && (
						<button
							type="button"
							onClick={handleLoadReplies}
							disabled={fetcher.state === "loading"}
							className="mt-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
						>
							{fetcher.state === "loading" ? "로딩 중..." : "답글 더 보기"}
						</button>
					)}
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

	// Handle toast notifications (Side Effect)
	// We still use useEffect for Toasts as they are imperative system interactions.
	// But Form Reset is now handled unidirectionally via the `key` prop below.
	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			if (fetcher.data.success) {
				toast.success("댓글이 등록되었습니다.");
				if (onCancel) onCancel();
			} else if (fetcher.data.error) {
				toast.error(fetcher.data.error);
			}
		}
	}, [fetcher.state, fetcher.data, onCancel]);

	// Unidirectional Reset:
	// When success timestamp updates, the Form component remounts, clearing all uncontrolled inputs.
	const formKey = fetcher.data?.success ? `success-${fetcher.data.timestamp}` : "initial";

	return (
		<fetcher.Form
			key={formKey}
			method="POST"
			action="/api/comments"
			className="stack-sm"
		>
			<input type="hidden" name="intent" value="create" />
			<input type="hidden" name="postId" value={postId} />
			{parentId && <input type="hidden" name="parentId" value={parentId} />}

			<textarea
				name="content"
				rows={parentId ? 2 : 3}
				placeholder={parentId ? "답글을 작성하세요..." : "생각을 남겨주세요..."}
				className="w-full rounded-lg border-gray-200 p-3 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500"
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
						취소
					</Button>
				)}
				<Button type="submit" size="sm" disabled={isSubmitting}>
					{isSubmitting ? "등록 중..." : parentId ? "답글 달기" : "댓글 등록"}
				</Button>
			</div>
		</fetcher.Form>
	);
}
