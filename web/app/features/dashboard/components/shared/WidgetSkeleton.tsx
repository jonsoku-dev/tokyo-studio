import type { WidgetLayout } from "@itcom/db/schema";

interface WidgetSkeletonProps {
	size: WidgetLayout["size"];
}

/**
 * Widget Skeleton Loader
 * Suspense fallback용 로딩 스켈레톤
 */
export function WidgetSkeleton({ size }: WidgetSkeletonProps) {
	const heights = {
		compact: "h-32",
		standard: "h-64",
		expanded: "h-80",
	};

	return (
		<div className={`animate-pulse ${heights[size]}`}>
			<div className="space-y-3">
				{/* 제목 */}
				<div className="h-4 w-1/3 rounded bg-gray-200" />

				{/* 컨텐츠 라인들 */}
				<div className="space-y-2">
					<div className="h-3 rounded bg-gray-200" />
					<div className="h-3 w-5/6 rounded bg-gray-200" />
					{size !== "compact" && (
						<>
							<div className="h-3 w-4/6 rounded bg-gray-200" />
							<div className="h-3 w-3/6 rounded bg-gray-200" />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
