import { useSearchParams } from "react-router";
import { Button } from "~/shared/components/ui/Button";

export function SearchFilters() {
	const [searchParams, setSearchParams] = useSearchParams();
	const category = searchParams.get("category") || "all";
	const time = searchParams.get("time") || "all";

	const updateFilter = (key: string, value: string) => {
		const newParams = new URLSearchParams(searchParams);
		if (value === "all") {
			newParams.delete(key);
		} else {
			newParams.set(key, value);
		}
		setSearchParams(newParams);
	};

	return (
		<div className="stack-md">
			<div>
				<h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
				<div className="cluster-sm">
					{["all", "general", "qna", "review"].map((c) => (
						<Button
							key={c}
							variant={category === c ? "primary" : "outline"}
							size="sm"
							onClick={() => updateFilter("category", c)}
							className="capitalize"
						>
							{c}
						</Button>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-gray-500 mb-2">Time Range</h3>
				<div className="cluster-sm">
					{[
						{ label: "All Time", value: "all" },
						{ label: "Past Week", value: "week" },
						{ label: "Past Month", value: "month" },
						{ label: "Past Year", value: "year" },
					].map((t) => (
						<Button
							key={t.value}
							variant={time === t.value ? "primary" : "outline"}
							size="sm"
							onClick={() => updateFilter("time", t.value)}
						>
							{t.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
