import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import type { PipelineItem, PipelineStage } from "../domain/pipeline.types";

// Lazy load the client-only KanbanBoard
const KanbanBoardClient = lazy(() =>
	import("./KanbanBoard.client").then((mod) => ({ default: mod.KanbanBoard })),
);

interface KanbanBoardWrapperProps {
	items: PipelineItem[];
	stages: PipelineStage[];
	onEditItem: (item: PipelineItem) => void;
	onDeleteItem: (item: PipelineItem) => void;
}

// ClientOnly wrapper - only renders children on client
function ClientOnly({
	children,
	fallback,
}: {
	children: () => ReactNode;
	fallback: ReactNode;
}) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return fallback;
	}

	return children();
}

// Skeleton for SSR fallback - Grid layout (matches Roadmap)
function KanbanBoardSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
			{Array.from({ length: 3 }).map((_, colIndex) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton content
					key={colIndex}
					className="min-h-[500px] rounded-2xl bg-gray-50/50 p-4"
				>
					<div className="mb-4 flex items-center justify-between">
						<div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
						<div className="h-6 w-8 animate-pulse rounded bg-gray-200" />
					</div>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton content
								key={`${colIndex}-${i}`}
								className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white p-3"
							>
								<div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-3 w-1/2 rounded bg-gray-100" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function KanbanBoard({
	items,
	stages,
	onEditItem,
	onDeleteItem,
}: KanbanBoardWrapperProps) {
	return (
		<ClientOnly fallback={<KanbanBoardSkeleton />}>
			{() => (
				<Suspense fallback={<KanbanBoardSkeleton />}>
					<KanbanBoardClient
						items={items}
						stages={stages}
						onEditItem={onEditItem}
						onDeleteItem={onDeleteItem}
					/>
				</Suspense>
			)}
		</ClientOnly>
	);
}
