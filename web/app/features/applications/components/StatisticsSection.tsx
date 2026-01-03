import { Briefcase, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import type { PipelineItem } from "../domain/pipeline.types";

interface StatisticsSectionProps {
	items: PipelineItem[];
}

export function StatisticsSection({ items }: StatisticsSectionProps) {
	// Calculate stats
	const total = items.length;
	const active = items.filter(
		(i) =>
			![
				"partially_rejected", // if exists
				"rejected",
				"withdrawn",
				"joined",
				"visa_coe",
			].includes(i.stage),
	).length;

	const interviewing = items.filter((i) =>
		["interview_1", "interview_2", "interview_3"].includes(i.stage),
	).length;

	const offers = items.filter((i) => i.stage === "offer").length;

	const stats = [
		{
			label: "총 지원",
			value: total,
			icon: Briefcase,
			color: "text-gray-600",
			bg: "bg-gray-100",
		},
		{
			label: "진행 중",
			value: active,
			icon: TrendingUp,
			color: "text-blue-600",
			bg: "bg-blue-100",
		},
		{
			label: "면접 진행",
			value: interviewing,
			icon: FileText,
			color: "text-purple-600",
			bg: "bg-purple-100",
		},
		{
			label: "합격/오퍼",
			value: offers,
			icon: CheckCircle2,
			color: "text-green-600",
			bg: "bg-green-100",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div className="flex items-start justify-between">
						<div>
							<p className="font-medium text-gray-500 text-sm">{stat.label}</p>
							<p className="mt-1 font-bold text-2xl text-gray-900">
								{stat.value}
							</p>
						</div>
						<div className={`rounded-lg p-2 ${stat.bg}`}>
							<stat.icon className={`h-5 w-5 ${stat.color}`} />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
