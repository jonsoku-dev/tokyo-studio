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
		<div className="stack-md rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
			<div>
				<h3 className="mb-3 body-sm uppercase tracking-wider text-gray-500">
					Job Family
				</h3>
				<div className="cluster-sm">
					<Button
						variant={!currentJob ? "primary" : "outline"}
						size="sm"
						onClick={() => handleJobChange(null)}
					>
						All
					</Button>
					{JOB_FAMILIES.map((job) => (
						<Button
							key={job}
							variant={currentJob === job ? "primary" : "outline"}
							size="sm"
							onClick={() => handleJobChange(job)}
						>
							{job}
						</Button>
					))}
				</div>
			</div>

			{/* Price Filter - Simplified Inputs */}
			<div>
				<h3 className="mb-3 body-sm uppercase tracking-wider text-gray-500">
					Hourly Rate ($)
				</h3>
				<div className="flex items-center gap-2">
					<input
						type="number"
						placeholder="Min"
						className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
						defaultValue={minPrice || ""}
						onBlur={(e) => {
							const p = new URLSearchParams(searchParams);
							if (e.target.value)
								p.set("minPrice", String(Number(e.target.value) * 100)); // input dollars -> cents
							else p.delete("minPrice");
							navigate(`?${p.toString()}`);
						}}
					/>
					<span className="text-gray-500">-</span>
					<input
						type="number"
						placeholder="Max"
						className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
						defaultValue={maxPrice || ""}
						onBlur={(e) => {
							// Correct logic: if parsing is robust.
							// For MVP, handling onBlur.
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
	);
}
