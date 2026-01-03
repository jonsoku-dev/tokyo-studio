import type { WidgetLayout } from "@itcom/db/schema";
import { Bookmark, Building2, Clock } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface JobPostingTrackerWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

/**
 * Job Posting Tracker Widget (Phase 3B)
 * 저장한 채용 공고 추적
 */
export default function JobPostingTrackerWidget({
	size: _size,
	widgetData,
}: JobPostingTrackerWidgetProps) {
	const { savedJobs, newPostingsCount } = widgetData.jobPostingTracker;

	// D-Day 색상
	const getDeadlineColor = (days: number | null) => {
		if (days === null) return "text-gray-400";
		if (days <= 3) return "text-red-600";
		if (days <= 7) return "text-orange-600";
		return "text-gray-500";
	};

	if (savedJobs.length === 0) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
					<Bookmark className="h-7 w-7 text-primary-600" />
				</div>
				<div>
					<p className="font-medium text-gray-900">관심 공고</p>
					<p className="mt-1 text-gray-500 text-sm">
						관심 있는 채용 공고를 저장해보세요
					</p>
				</div>
				<Link
					to="/jobs"
					className="inline-block rounded-lg bg-primary-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary-700"
				>
					공고 둘러보기 →
				</Link>
			</div>
		);
	}

	const maxItems = _size === "compact" ? 2 : 4;
	const displayJobs = savedJobs.slice(0, maxItems);

	return (
		<div className="space-y-3">
			{/* 새 공고 알림 */}
			{newPostingsCount > 0 && (
				<div className="flex items-center justify-between rounded-lg bg-primary-50 p-2">
					<span className="text-primary-700 text-sm">
						새 공고 {newPostingsCount}개
					</span>
					<Link
						to="/jobs?new=true"
						className="font-medium text-primary-600 text-sm hover:text-primary-700"
					>
						확인 →
					</Link>
				</div>
			)}

			{/* 저장된 공고 목록 */}
			{displayJobs.map((job) => (
				<Link
					key={job.id}
					to={`/jobs/${job.id}`}
					className="group block rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-300 hover:bg-primary-50/30"
				>
					<div className="flex items-start gap-3">
						<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
							<Building2 className="h-4 w-4 text-gray-600" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-gray-900 text-sm">
								{job.company}
							</p>
							<p className="truncate text-gray-500 text-xs">{job.position}</p>
							{job.daysUntilDeadline !== null && (
								<p
									className={`mt-1 flex items-center gap-1 text-xs ${getDeadlineColor(job.daysUntilDeadline)}`}
								>
									<Clock className="h-3 w-3" />
									{job.daysUntilDeadline <= 0
										? "마감"
										: `D-${job.daysUntilDeadline}`}
								</p>
							)}
						</div>
					</div>
				</Link>
			))}

			{/* 더보기 */}
			{savedJobs.length > maxItems && (
				<Link
					to="/jobs/saved"
					className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					+ {savedJobs.length - maxItems}개 더 보기
				</Link>
			)}
		</div>
	);
}
