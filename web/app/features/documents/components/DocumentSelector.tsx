/**
 * SPEC 022: DocumentSelector Component
 *
 * A shared component for selecting documents in different contexts:
 * - Pipeline: Select Resume/CV for job application
 * - Mentoring: Select documents to share with mentor
 * - Profile: Select Portfolio for public profile
 *
 * Design Principles:
 * - Unidirectional data flow (documents passed via props from loader)
 * - No useEffect for data fetching
 * - Controlled component pattern
 */

import { FileText, X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface DocumentOption {
	id: string;
	title: string;
	type: string;
	status: string;
	originalName?: string | null;
}

export interface DocumentSelectorProps {
	/** Available documents to select from (passed from loader) */
	documents: DocumentOption[];
	/** Currently selected document ID (single select mode) */
	selectedId?: string | null;
	/** Currently selected document IDs (multi select mode) */
	selectedIds?: string[];
	/** Selection mode */
	mode?: "single" | "multi";
	/** Maximum selectable documents (multi mode only) */
	maxSelections?: number;
	/** Callback when selection changes */
	onChange: (selected: string | string[] | null) => void;
	/** Label for the selector */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Optional hint text */
	hint?: string;
	/** Disabled state */
	disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function DocumentSelector({
	documents,
	selectedId,
	selectedIds = [],
	mode = "single",
	maxSelections = 5,
	onChange,
	label,
	placeholder = "Select a document...",
	hint,
	disabled = false,
}: DocumentSelectorProps) {
	const isSingle = mode === "single";
	const currentSelections = isSingle
		? selectedId
			? [selectedId]
			: []
		: selectedIds;

	// Get selected document info for display
	const selectedDocuments = documents.filter((doc) =>
		currentSelections.includes(doc.id),
	);

	// Handle single selection
	const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		onChange(value === "" ? null : value);
	};

	// Handle multi selection toggle
	const handleMultiToggle = (docId: string) => {
		if (currentSelections.includes(docId)) {
			// Remove
			onChange(currentSelections.filter((id) => id !== docId));
		} else if (currentSelections.length < maxSelections) {
			// Add
			onChange([...currentSelections, docId]);
		}
	};

	// Handle remove from multi selection
	const handleRemove = (docId: string) => {
		onChange(currentSelections.filter((id) => id !== docId));
	};

	return (
		<div className="space-y-2">
			{label && (
				<span className="block font-medium text-gray-700 text-sm">{label}</span>
			)}

			{isSingle ? (
				// Single Select Mode - Dropdown
				<select
					value={selectedId || ""}
					onChange={handleSingleChange}
					disabled={disabled || documents.length === 0}
					className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
				>
					<option value="">{placeholder}</option>
					{documents.map((doc) => (
						<option key={doc.id} value={doc.id}>
							{doc.title} ({doc.type} - {doc.status})
						</option>
					))}
				</select>
			) : (
				// Multi Select Mode - Checkboxes with chips
				<div className="space-y-3">
					{/* Selected chips */}
					{selectedDocuments.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{selectedDocuments.map((doc) => (
								<span
									key={doc.id}
									className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-primary-800 text-sm"
								>
									<FileText className="h-3 w-3" />
									{doc.title}
									<button
										type="button"
										onClick={() => handleRemove(doc.id)}
										className="ml-1 rounded-full hover:bg-primary-200"
										disabled={disabled}
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							))}
						</div>
					)}

					{/* Document list */}
					<div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white">
						{documents.length === 0 ? (
							<p className="p-3 text-center text-gray-500 text-sm">
								No documents available
							</p>
						) : (
							<ul className="divide-y divide-gray-100">
								{documents.map((doc) => {
									const isSelected = currentSelections.includes(doc.id);
									const canSelect =
										isSelected || currentSelections.length < maxSelections;

									return (
										<li key={doc.id}>
											<button
												type="button"
												onClick={() => handleMultiToggle(doc.id)}
												disabled={disabled || !canSelect}
												className={`w-full px-3 py-2 text-left text-sm transition-colors ${
													isSelected
														? "bg-primary-50 text-primary-900"
														: canSelect
															? "hover:bg-gray-50"
															: "cursor-not-allowed opacity-50"
												}`}
											>
												<div className="flex items-center gap-2">
													<input
														type="checkbox"
														checked={isSelected}
														readOnly
														className="h-4 w-4 rounded border-gray-300 text-primary-600"
													/>
													<FileText className="h-4 w-4 text-gray-400" />
													<span className="flex-1 truncate">{doc.title}</span>
													<span className="text-gray-500 text-xs">
														{doc.type} · {doc.status}
													</span>
												</div>
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>

					{/* Selection count */}
					<p className="text-gray-500 text-xs">
						{currentSelections.length} / {maxSelections} selected
					</p>
				</div>
			)}

			{hint && <p className="text-gray-500 text-xs">{hint}</p>}
		</div>
	);
}

export default DocumentSelector;
