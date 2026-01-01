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
				<h3 className="mb-2 font-medium text-gray-500 text-sm">카테고리</h3>
				<div className="cluster-sm">
					{[
						{ label: "전체", value: "all" },
						{ label: "일반", value: "general" },
						{ label: "질문", value: "qna" },
						{ label: "리뷰", value: "review" },
					].map((c) => (
						<Button
							key={c.value}
							variant={category === c.value ? "primary" : "outline"}
							size="sm"
							onClick={() => updateFilter("category", c.value)}
						>
							{c.label}
						</Button>
					))}
				</div>
			</div>

			<div>
				<h3 className="mb-2 font-medium text-gray-500 text-sm">기간</h3>
				<div className="cluster-sm">
					{[
						{ label: "전체", value: "all" },
						{ label: "최근 1주", value: "week" },
						{ label: "최근 1달", value: "month" },
						{ label: "최근 1년", value: "year" },
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
