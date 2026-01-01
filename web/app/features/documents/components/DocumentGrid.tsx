import { Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "~/shared/utils/cn";
import type { SelectDocument } from "../services/types";

interface DocumentGridProps {
	documents: SelectDocument[];
	onRename: (id: string, newTitle: string) => void;
	onStatusChange: (id: string, newStatus: string) => void;
	onDelete: (id: string) => void;
	onPreview: (doc: SelectDocument) => void;
}

export function DocumentGrid({
	documents,
	onRename,
	onStatusChange,
	onDelete,
	onPreview,
}: DocumentGridProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");

	const startEditing = (doc: SelectDocument) => {
		setEditingId(doc.id);
		setEditTitle(doc.title);
	};

	const saveTitle = (id: string) => {
		if (editTitle.trim()) {
			onRename(id, editTitle);
		}
		setEditingId(null);
	};

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{documents.map((doc) => (
				<div
					key={doc.id}
					className={cn(
						"group relative flex flex-col rounded-lg shadow-sm transition-shadow hover:shadow-md",
						doc.status === "draft"
							? "border-2 border-yellow-300 bg-yellow-50"
							: "border border-gray-200 bg-white",
					)}
				>
					{/* Thumbnail Area */}
					{/* Thumbnail Area */}
					<button
						type="button"
						className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-t-lg border-0 bg-gray-100 p-0 text-left transition-opacity group-hover:opacity-90"
						onClick={() => onPreview(doc)}
						onKeyDown={(e) => e.key === "Enter" && onPreview(doc)}
					>
						{doc.thumbnailUrl ? (
							<img
								src={doc.thumbnailUrl}
								alt={`Thumbnail for ${doc.title}`}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
								<FileText className="mb-2 h-12 w-12" />
								<span className="font-medium text-xs uppercase tracking-wider">
									{doc.type}
								</span>
							</div>
						)}

						{/* Overlay Actions */}
						<div className="center absolute inset-0 gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
							<button
								type="button"
								className="center h-9 w-9 cursor-pointer rounded-full border-0 bg-white/90 p-0 text-gray-700 transition-colors hover:bg-white"
								onClick={(e) => {
									e.stopPropagation();
									onPreview(doc);
								}}
								title="Preview"
							>
								<Eye className="h-4 w-4" />
							</button>
							{doc.url && (
								<a
									href={doc.url}
									target="_blank"
									rel="noreferrer"
									className="center h-9 w-9 rounded-full bg-white/90 text-gray-700 transition-colors hover:bg-white"
									onClick={(e) => e.stopPropagation()}
									title="Download"
								>
									<Download className="h-4 w-4" />
								</a>
							)}
						</div>
					</button>

					{/* Content Area */}
					<div className="flex flex-1 flex-col gap-2 p-4">
						{/* Header: Title & Menu */}
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								{editingId === doc.id ? (
									<input
										type="text"
										// biome-ignore lint/a11y/noAutofocus: Input focus needed for inline editing
										autoFocus
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onBlur={() => saveTitle(doc.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter") saveTitle(doc.id);
											if (e.key === "Escape") setEditingId(null);
										}}
										className="w-full rounded border-gray-300 px-1 py-0.5 font-medium text-sm focus:border-primary-500 focus:ring-primary-500"
									/>
								) : (
									<button
										type="button"
										className="heading-5 cursor-pointer truncate border-0 bg-transparent p-0 text-left text-sm hover:text-primary-600"
										onClick={() => startEditing(doc)}
										title={doc.title}
									>
										{doc.title}
									</button>
								)}
								<p className="caption truncate">{doc.originalName}</p>
							</div>

							{/* Status Badge */}
							<button
								type="button"
								onClick={() =>
									onStatusChange(
										doc.id,
										doc.status === "final" ? "draft" : "final",
									)
								}
								className={cn(
									"rounded-full border px-2 py-0.5 font-semibold text-[0.65rem] uppercase tracking-wide transition-colors",
									doc.status === "final"
										? "border-accent-200 bg-accent-50 text-accent-700 hover:bg-accent-100"
										: "border-yellow-300 bg-yellow-200 text-yellow-800 hover:bg-yellow-300",
								)}
							>
								{doc.status}
							</button>
						</div>

						{/* Draft Warning */}
						{doc.status === "draft" && (
							<p className="mt-1 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
								⚠️ Draft version - Mark as final when ready
							</p>
						)}

						{/* Footer: Metadata & Actions */}
						<div className="caption mt-auto flex items-center justify-between border-gray-100 border-t pt-2">
							<div className="flex items-center gap-2">
								<span>
									{((Number(doc.size) || 0) / 1024 / 1024).toFixed(1)} MB
								</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<Download className="h-3 w-3" />
									{doc.downloadCount || 0}
								</span>
								<span>•</span>
								<span>
									{doc.createdAt
										? new Date(doc.createdAt).toLocaleDateString()
										: "-"}
								</span>
							</div>

							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={() => startEditing(doc)}
									className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
									title="Rename"
								>
									<Pencil className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={() => onDelete(doc.id)}
									className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
									title="Delete"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
