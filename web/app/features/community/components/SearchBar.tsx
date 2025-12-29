import { HelpCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useFetcher, useNavigate, useSearchParams } from "react-router";
import { Input } from "~/shared/components/ui/Input";

export function SearchBar() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const fetcher = useFetcher<{ suggestions: string[] }>();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const [isOpen, setIsOpen] = useState(false);
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		if (debouncedQuery.length >= 2) {
			fetcher.load(
				`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`,
			);
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [debouncedQuery, fetcher.load]);

	const suggestions = fetcher.data?.suggestions || [];
	const [showHelp, setShowHelp] = useState(false);

	return (
		<div className="relative w-full max-w-lg">
			<Form action="/community/search" method="get" className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
				<Input
					name="q"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onBlur={() => setTimeout(() => setIsOpen(false), 200)}
					placeholder="Search titles, content, tags..."
					className="pl-9 pr-10 w-full"
					autoComplete="off"
				/>
				<button
					type="button"
					onClick={() => setShowHelp(!showHelp)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
					title="Search help"
				>
					<HelpCircle className="h-4 w-4" />
				</button>
			</Form>

			{/* Search Help Popover */}
			{showHelp && (
				<div className="absolute top-full mt-1 right-0 w-80 bg-white rounded-lg border shadow-lg z-50 p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-semibold text-gray-900">Search Tips</h3>
						<button
							type="button"
							onClick={() => setShowHelp(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							×
						</button>
					</div>
					<ul className="space-y-2 text-sm text-gray-700">
						<li className="flex items-start gap-2">
							<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
								react hooks
							</code>
							<span className="text-gray-600">Find posts with both words</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
								react OR vue
							</code>
							<span className="text-gray-600">Find posts with either word</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
								react -vue
							</code>
							<span className="text-gray-600">Exclude a word</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
								"exact phrase"
							</code>
							<span className="text-gray-600">Search exact phrase</span>
						</li>
					</ul>
				</div>
			)}


			{isOpen && suggestions.length > 0 && (
				<div className="absolute top-full mt-1 w-full bg-white rounded-md border shadow-lg z-50 overflow-hidden">
					<ul className="py-1">
						{suggestions.map((suggestion, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: simple list
							<li key={idx}>
								<button
									type="button"
									className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
									onClick={() => {
										setQuery(suggestion);
										setIsOpen(false);
										navigate(
											`/community/search?q=${encodeURIComponent(suggestion)}`,
										);
									}}
								>
									{suggestion}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// Simple debounce hook if not exists
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);
	return debouncedValue;
}
