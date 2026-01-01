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
		<div className="stack-sm w-full">
			<div className="flex items-center justify-between">
				<label htmlFor={id} className="block font-medium text-gray-700 text-sm">
					{label}
				</label>
				<div className="flex gap-1 rounded-md bg-gray-100 p-1">
					<button
						type="button"
						onClick={() => setIsPreview(false)}
						className={clsx(
							"flex items-center gap-1 rounded px-3 py-1 font-medium text-xs transition-colors",
							!isPreview
								? "border border-gray-200 bg-white text-gray-900 shadow-sm"
								: "text-gray-500 hover:text-gray-900",
						)}
					>
						<Edit2 className="h-3 w-3" />
						Write
					</button>
					<button
						type="button"
						onClick={() => setIsPreview(true)}
						className={clsx(
							"flex items-center gap-1 rounded px-3 py-1 font-medium text-xs transition-colors",
							isPreview
								? "border border-gray-200 bg-white text-gray-900 shadow-sm"
								: "text-gray-500 hover:text-gray-900",
						)}
					>
						<Eye className="h-3 w-3" />
						Preview
					</button>
				</div>
			</div>

			<div
				className={clsx(
					"min-h-[200px] w-full overflow-hidden rounded-md border transition-all",
					isPreview
						? "border-gray-200 bg-gray-50 p-4"
						: "border-gray-300 bg-white focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500",
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
						className="h-full w-full resize-y border-0 bg-transparent p-3 font-mono text-gray-800 text-sm outline-none focus:ring-0"
						rows={rows}
						placeholder={placeholder}
					/>
				)}
			</div>
			<p className="caption text-right">Markdown supported</p>
		</div>
	);
}
