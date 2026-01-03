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
				<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
				<Input
					name="q"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onBlur={() => setTimeout(() => setIsOpen(false), 200)}
					placeholder="제목, 내용, 태그 검색..."
					className="w-full pr-10 pl-9"
					autoComplete="off"
				/>
				<button
					type="button"
					onClick={() => setShowHelp(!showHelp)}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
					title="검색 도움말"
				>
					<HelpCircle className="h-4 w-4" />
				</button>
			</Form>

			{/* Search Help Popover */}
			{showHelp && (
				<div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-lg border bg-white p-responsive shadow-lg">
					<div className="mb-3 flex items-center justify-between">
						<h3 className="heading-5">검색 팁</h3>
						<button
							type="button"
							onClick={() => setShowHelp(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							×
						</button>
					</div>
					<ul className="stack-sm text-gray-700 text-sm">
						<li className="flex items-start gap-2">
							<code className="whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
								react hooks
							</code>
							<span className="text-gray-600">두 단어가 모두 포함된 글</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
								react OR vue
							</code>
							<span className="text-gray-600">
								두 단어 중 하나라도 포함된 글
							</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
								react -vue
							</code>
							<span className="text-gray-600">특정 단어 제외</span>
						</li>
						<li className="flex items-start gap-2">
							<code className="whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
								"exact phrase"
							</code>
							<span className="text-gray-600">정확한 문구 일치</span>
						</li>
					</ul>
				</div>
			)}

			{isOpen && suggestions.length > 0 && (
				<div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
					<ul className="py-1">
						{suggestions.map((suggestion, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: simple list
							<li key={idx}>
								<button
									type="button"
									className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
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
