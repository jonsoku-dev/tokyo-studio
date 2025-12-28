import { clsx } from "clsx";
import { Edit2, Eye } from "lucide-react";
import { useState } from "react";
import { PostContent } from "./PostContent";

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	placeholder?: string;
	rows?: number;
}

export function MarkdownEditor({
	value,
	onChange,
	label = "Content",
	placeholder = "Write your content in markdown...",
	rows = 10,
	id = "markdown-editor",
}: MarkdownEditorProps & { id?: string }) {
	const [isPreview, setIsPreview] = useState(false);

	return (
		<div className="w-full space-y-2">
			<div className="flex items-center justify-between">
				<label htmlFor={id} className="block text-sm font-medium text-gray-700">
					{label}
				</label>
				<div className="flex bg-gray-100 rounded-md p-1 gap-1">
					<button
						type="button"
						onClick={() => setIsPreview(false)}
						className={clsx(
							"px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1",
							!isPreview
								? "bg-white text-gray-900 shadow-sm border border-gray-200"
								: "text-gray-500 hover:text-gray-900",
						)}
					>
						<Edit2 className="w-3 h-3" />
						Write
					</button>
					<button
						type="button"
						onClick={() => setIsPreview(true)}
						className={clsx(
							"px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1",
							isPreview
								? "bg-white text-gray-900 shadow-sm border border-gray-200"
								: "text-gray-500 hover:text-gray-900",
						)}
					>
						<Eye className="w-3 h-3" />
						Preview
					</button>
				</div>
			</div>

			<div
				className={clsx(
					"w-full rounded-md border min-h-[200px] transition-all overflow-hidden",
					isPreview
						? "bg-gray-50 border-gray-200 p-4"
						: "bg-white border-gray-300 focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500",
				)}
			>
				{isPreview ? (
					value ? (
						<PostContent content={value} />
					) : (
						<div className="text-gray-400 text-sm italic">
							Nothing to preview
						</div>
					)
				) : (
					<textarea
						id={id}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						name="content" // Important: keep name for form submission if used uncontrolled, though here we control it.
						className="w-full h-full p-3 border-0 focus:ring-0 text-sm font-mono text-gray-800 bg-transparent resize-y outline-none"
						rows={rows}
						placeholder={placeholder}
					/>
				)}
			</div>
			<p className="text-xs text-gray-500 text-right">Markdown supported</p>
		</div>
	);
}
