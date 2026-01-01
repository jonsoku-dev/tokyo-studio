import { formatDistanceToNow } from "date-fns";
import { Edit2, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useFetcher } from "react-router";
import remarkGfm from "remark-gfm";
import { VoteControl } from "~/features/community/components/VoteControl";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Button } from "~/shared/components/ui/Button";
import { cn } from "~/shared/utils/cn";
import type { CommentWithAuthor } from "../services/types";

interface CommentItemProps {
	comment: CommentWithAuthor;
	currentUserId?: string;
	onReply: (parentId: string) => void;
}

export function CommentItem({
	comment,
	currentUserId,
	onReply,
}: CommentItemProps) {
	const fetcher = useFetcher();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	const handleDelete = () => {
		if (confirm("Are you sure you want to delete this comment?")) {
			fetcher.submit(
				{ intent: "delete" },
				{ method: "POST", action: `/api/comments/${comment.id}` },
			);
		}
	};

	const handleSaveEdit = () => {
		fetcher.submit(
			{ intent: "update", content: editContent },
			{ method: "PATCH", action: `/api/comments/${comment.id}` },
		);
		setIsEditing(false);
	};

	const isDeleted = !comment.author;

	return (
		<div className="group flex gap-3">
			{/* Avatar Column */}
			<div className="flex flex-col items-center">
				<Avatar
					src={
						comment.author?.avatarThumbnailUrl ||
						comment.author?.avatarUrl ||
						undefined
					}
					alt={comment.author?.name || "Deleted"}
					className="h-8 w-8 text-xs"
					fallback={isDeleted ? "?" : undefined}
				/>
				{/* Thread Line - only if not last child? Logic handled by parent usually or absolute positioning */}
				{/* We'll handle thread lines in the Thread component or use simple border-l here if indented */}
			</div>

			{/* Content Column */}
			<div className="stack-xs.5 min-w-0 flex-1">
				{/* Request: Header */}
				<div className="caption flex items-center gap-2">
					<span
						className={cn(
							"font-medium",
							isDeleted ? "text-gray-400 italic" : "text-gray-900",
						)}
					>
						{comment.author?.name || "[deleted]"}
					</span>
					<span>•</span>
					<span>
						{comment.createdAt &&
						!Number.isNaN(new Date(comment.createdAt).getTime())
							? formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
								})
							: "unknown"}
					</span>
					{comment.isEdited && <span className="italic">(edited)</span>}
				</div>

				{/* Body */}
				<div className="prose prose-sm prose-p:my-1 max-w-none prose-a:text-primary-600 text-gray-800 text-sm">
					{isEditing ? (
						<div className="stack-sm">
							<textarea
								className="w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
								rows={3}
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
							/>
							<div className="flex justify-end gap-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setIsEditing(false)}
								>
									Cancel
								</Button>
								<Button size="sm" onClick={handleSaveEdit}>
									Save
								</Button>
							</div>
						</div>
					) : (
						<div className={cn(isDeleted && "text-gray-400 italic")}>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{comment.content}
							</ReactMarkdown>
						</div>
					)}
				</div>

				{/* Actions Footer */}
				{!isDeleted && (
					<div className="flex items-center gap-4 pt-1">
						{/* Vote Controls */}
						<VoteControl
							id={comment.id}
							type="comment"
							initialScore={comment.score || 0}
							initialVote={comment.userVote}
							size="sm"
						/>

						{/* Reply Button */}
						<button
							type="button"
							onClick={() => onReply(comment.id)}
							className="flex items-center gap-1 font-medium text-gray-500 text-xs transition-colors hover:text-gray-900"
						>
							<MessageSquare className="h-4 w-4" />
							Reply
						</button>

						{/* Owner Actions */}
						{currentUserId === comment.author?.id && (
							<>
								<button
									type="button"
									onClick={() => setIsEditing(true)}
									className="flex items-center gap-1 font-medium text-gray-500 text-xs transition-colors hover:text-gray-900"
								>
									<Edit2 className="h-3.5 w-3.5" />
									Edit
								</button>
								<button
									type="button"
									onClick={handleDelete}
									className="flex items-center gap-1 font-medium text-gray-500 text-xs transition-colors hover:text-red-600"
								>
									<Trash2 className="h-3.5 w-3.5" />
									Delete
								</button>
							</>
						)}

						{/* Report Action - Only if not own comment */}
						{currentUserId && currentUserId !== comment.author?.id && (
							<ReportAction commentId={comment.id} />
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function ReportAction({ commentId }: { commentId: string }) {
	const fetcher = useFetcher();
	const [isOpen, setIsOpen] = useState(false);
	// Simple verification check
	const isSubmitted = fetcher.state === "idle" && fetcher.data?.success;

	const handleSubmit = (_: React.FormEvent<HTMLFormElement>) => {
		// We will close it via effect or timeout, but fetcher handles submission
		if (isSubmitted) {
			setTimeout(() => setIsOpen(false), 1000);
		}
	};

	// Close on success effect
	if (isSubmitted && isOpen) {
		setTimeout(() => setIsOpen(false), 1500);
	}

	if (isOpen) {
		return (
			<div className="center fixed inset-0 z-50 bg-black/50 p-4">
				<div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
					<h3 className="heading-5 mb-4">Report Comment</h3>
					{isSubmitted ? (
						<div className="py-4 text-center font-medium text-accent-600">
							Report submitted. Thank you.
						</div>
					) : (
						<fetcher.Form
							method="POST"
							action={`/api/comments/${commentId}/report`}
							onSubmit={handleSubmit}
						>
							<select
								name="reason"
								className="mb-4 w-full rounded-md border p-2 text-sm"
								required
							>
								<option value="">Select a reason...</option>
								<option value="spam">Spam</option>
								<option value="harassment">Harassment</option>
								<option value="inappropriate">Inappropriate Content</option>
								<option value="other">Other</option>
							</select>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="border-transparent bg-red-600 text-white hover:bg-red-700"
								>
									Submit Report
								</Button>
							</div>
						</fetcher.Form>
					)}
				</div>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setIsOpen(true)}
			className="ml-auto flex hidden items-center gap-1 font-medium text-gray-400 text-xs transition-colors hover:text-red-500 group-hover:block"
		>
			Flag
		</button>
	);
}
