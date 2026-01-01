import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/shared/components/ui/Button";

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
					Job Family
				</h3>
				<div className="flex flex-wrap gap-2">
					<Button
						variant={!currentJob ? "primary" : "outline"}
						size="sm"
						className={`rounded-full ${!currentJob ? "" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
						onClick={() => handleJobChange(null)}
					>
						All
					</Button>
					{JOB_FAMILIES.map((job) => (
						<Button
							key={job}
							variant={currentJob === job ? "primary" : "outline"}
							size="sm"
							className={`rounded-full ${currentJob === job ? "" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
							onClick={() => handleJobChange(job)}
						>
							{job}
						</Button>
					))}
				</div>
			</div>

			{/* Price Filter - Simplified Inputs */}
			<div>
				<h3 className="caption mb-3 border-gray-100 border-b pb-2 font-bold text-gray-900 uppercase tracking-wider">
					Hourly Rate ($)
				</h3>
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<span className="caption absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400">
							$
						</span>
						<input
							type="number"
							placeholder="Min"
							className="body-sm w-full rounded-md border border-gray-300 bg-white py-2 pr-2 pl-5 text-gray-900 placeholder-gray-400 transition-shadow focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
							defaultValue={minPrice ? Number(minPrice) / 100 : ""}
							onBlur={(e) => {
								const p = new URLSearchParams(searchParams);
								if (e.target.value)
									p.set("minPrice", String(Number(e.target.value) * 100)); // input dollars -> cents
								else p.delete("minPrice");
								navigate(`?${p.toString()}`);
							}}
						/>
					</div>
					<span className="text-gray-400">-</span>
					<div className="relative flex-1">
						<span className="caption absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400">
							$
						</span>
						<input
							type="number"
							placeholder="Max"
							className="body-sm w-full rounded-md border border-gray-300 bg-white py-2 pr-2 pl-5 text-gray-900 placeholder-gray-400 transition-shadow focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
							defaultValue={maxPrice ? Number(maxPrice) / 100 : ""}
							onBlur={(e) => {
								const p = new URLSearchParams(searchParams);
								if (e.target.value)
									p.set("maxPrice", String(Number(e.target.value) * 100));
								else p.delete("maxPrice");
								navigate(`?${p.toString()}`);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
