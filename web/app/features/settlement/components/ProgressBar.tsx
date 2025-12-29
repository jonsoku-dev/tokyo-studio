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
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
			<div className="flex items-center justify-between mb-3">
				<span className="text-sm font-bold text-gray-700">
					전체 진행률 / 全体進捗
				</span>
				<span className="text-2xl font-bold text-orange-600">
					{percentage}%
				</span>
			</div>
			<div className="h-4 bg-gray-100 rounded-full overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<p className="text-sm text-gray-500 mt-2">
				{completed} / {total} 완료 ({total - completed}개 남음)
			</p>
		</div>
	);
}
