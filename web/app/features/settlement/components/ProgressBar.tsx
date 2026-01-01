interface ProgressBarProps {
	completed: number;
	total: number;
	percentage: number;
}

export function ProgressBar({
	completed,
	total,
	percentage,
}: ProgressBarProps) {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			<div className="mb-3 flex items-center justify-between">
				<span className="body-sm text-gray-700">전체 진행률 / 全体進捗</span>
				<span className="heading-3 text-primary-600">{percentage}%</span>
			</div>
			<div className="h-4 overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<p className="caption mt-2">
				{completed} / {total} 완료 ({total - completed}개 남음)
			</p>
		</div>
	);
}
