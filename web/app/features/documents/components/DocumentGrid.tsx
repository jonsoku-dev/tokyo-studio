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
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{documents.map((doc) => (
				<div
					key={doc.id}
					className={cn(
						"group relative rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col",
						doc.status === "draft"
							? "bg-yellow-50 border-2 border-yellow-300"
							: "bg-white border border-gray-200",
					)}
				>
					{/* Thumbnail Area */}
					{/* Thumbnail Area */}
					<button
						type="button"
						className="aspect-[3/4] bg-gray-100 rounded-t-lg relative overflow-hidden cursor-pointer group-hover:opacity-90 transition-opacity w-full text-left p-0 border-0"
						onClick={() => onPreview(doc)}
						onKeyDown={(e) => e.key === "Enter" && onPreview(doc)}
					>
						{doc.thumbnailUrl ? (
							<img
								src={doc.thumbnailUrl}
								alt={`Thumbnail for ${doc.title}`}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
								<FileText className="h-12 w-12 mb-2" />
								<span className="text-xs uppercase tracking-wider font-medium">
									{doc.type}
								</span>
							</div>
						)}

						{/* Overlay Actions */}
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
							<button
								type="button"
								className="flex items-center justify-center h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-700 transition-colors cursor-pointer border-0 p-0"
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
									className="flex items-center justify-center h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-700 transition-colors"
									onClick={(e) => e.stopPropagation()}
									title="Download"
								>
									<Download className="h-4 w-4" />
								</a>
							)}
						</div>
					</button>

					{/* Content Area */}
					<div className="p-4 flex flex-col flex-1 gap-2">
						{/* Header: Title & Menu */}
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
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
										className="w-full text-sm font-medium border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 px-1 py-0.5"
									/>
								) : (
									<button
										type="button"
										className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-orange-600 text-left p-0 border-0 bg-transparent"
										onClick={() => startEditing(doc)}
										title={doc.title}
									>
										{doc.title}
									</button>
								)}
								<p className="text-xs text-gray-500 truncate">
									{doc.originalName}
								</p>
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
									"px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide rounded-full border transition-colors",
									doc.status === "final"
										? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
										: "bg-yellow-200 text-yellow-800 border-yellow-300 hover:bg-yellow-300",
								)}
							>
								{doc.status}
							</button>
						</div>

						{/* Draft Warning */}
						{doc.status === "draft" && (
							<p className="text-xs text-yellow-700 mt-1 px-2 py-1 bg-yellow-100 rounded">
								⚠️ Draft version - Mark as final when ready
							</p>
						)}

						{/* Footer: Metadata & Actions */}
						<div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
							<div className="flex gap-2 items-center">
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
									className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
									title="Rename"
								>
									<Pencil className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={() => onDelete(doc.id)}
									className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
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
