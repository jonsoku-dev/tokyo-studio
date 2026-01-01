import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";

const JOB_FAMILIES = [
	"Frontend",
	"Backend",
	"Mobile",
	"DevOps",
	"Cybersecurity",
	"Data",
	"Product",
	"Design",
];

const ADD_JOB_LABELS: Record<string, string> = {
	Frontend: "프론트엔드",
	Backend: "백엔드",
	Mobile: "모바일",
	DevOps: "데브옵스",
	Cybersecurity: "보안",
	Data: "데이터",
	Product: "기획/PM",
	Design: "디자인",
};

export function MentorFilters() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const currentJob = searchParams.get("jobFamily");
	const minPrice = searchParams.get("minPrice");
	const maxPrice = searchParams.get("maxPrice");

	const handleJobChange = (job: string | null) => {
		const newParams = new URLSearchParams(searchParams);
		if (job) newParams.set("jobFamily", job);
		else newParams.delete("jobFamily");
		navigate(`?${newParams.toString()}`);
	};

	return (
		<div className="stack-lg">
			<div>
				<h3 className="caption mb-3 border-gray-100 border-b pb-2 font-bold text-gray-900 uppercase tracking-wider">
					직군 (Job Family)
				</h3>
				<div className="flex flex-wrap gap-2">
					<Button
						variant={!currentJob ? "primary" : "outline"}
						size="sm"
						className={`rounded-full ${!currentJob ? "" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
						onClick={() => handleJobChange(null)}
					>
						전체
					</Button>
					{JOB_FAMILIES.map((job) => (
						<Button
							key={job}
							variant={currentJob === job ? "primary" : "outline"}
							size="sm"
							className={`rounded-full ${currentJob === job ? "" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
							onClick={() => handleJobChange(job)}
						>
							{ADD_JOB_LABELS[job] || job}
						</Button>
					))}
				</div>
			</div>

			{/* Price Filter - Simplified Inputs */}
			<div>
				<h3 className="caption mb-3 border-gray-100 border-b pb-2 font-bold text-gray-900 uppercase tracking-wider">
					시간당 비용 ($)
				</h3>
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Input
							name="minPrice"
							placeholder="최소"
							type="number"
							containerClassName="w-full"
							defaultValue={minPrice ? Number(minPrice) / 100 : ""}
							onBlur={(e) => {
								const p = new URLSearchParams(searchParams);
								if (e.target.value)
									p.set("minPrice", String(Number(e.target.value) * 100)); // input dollars -> cents
								else p.delete("minPrice");
								navigate(`?${p.toString()}`);
							}}
							startIcon={<span className="text-gray-400 text-xs">$</span>}
						/>
					</div>
					<span className="text-gray-400">-</span>
					<div className="relative flex-1">
						<Input
							name="maxPrice"
							placeholder="최대"
							type="number"
							containerClassName="w-full"
							defaultValue={maxPrice ? Number(maxPrice) / 100 : ""}
							onBlur={(e) => {
								const p = new URLSearchParams(searchParams);
								if (e.target.value)
									p.set("maxPrice", String(Number(e.target.value) * 100));
								else p.delete("maxPrice");
								navigate(`?${p.toString()}`);
							}}
							startIcon={<span className="text-gray-400 text-xs">$</span>}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
