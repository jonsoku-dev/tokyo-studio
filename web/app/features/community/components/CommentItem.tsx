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
		<div className="flex gap-3 group">
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
			<div className="flex-1 min-w-0 stack-xs.5">
				{/* Request: Header */}
				<div className="flex items-center caption gap-2">
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
				<div className="text-sm text-gray-800 prose prose-sm max-w-none prose-p:my-1 prose-a:text-primary-600">
					{isEditing ? (
						<div className="stack-sm">
							<textarea
								className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
							className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
									className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
								>
									<Edit2 className="h-3.5 w-3.5" />
									Edit
								</button>
								<button
									type="button"
									onClick={handleDelete}
									className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
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
			<div className="fixed inset-0 z-50 center bg-black/50 p-4">
				<div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
					<h3 className="heading-5 mb-4">Report Comment</h3>
					{isSubmitted ? (
						<div className="text-center text-accent-600 py-4 font-medium">
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
								className="w-full p-2 border rounded-md mb-4 text-sm"
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
									className="bg-red-600 hover:bg-red-700 text-white border-transparent"
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
			className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto group-hover:block hidden"
		>
			Flag
		</button>
	);
}
