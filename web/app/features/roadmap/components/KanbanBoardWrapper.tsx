import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import type { RoadmapTask } from "../stores/roadmap.store";
import type { KanbanColumnConfig } from "./kanban.types";

// Lazy load the client-only KanbanBoard
const KanbanBoardClient = lazy(() =>
	import("./KanbanBoard.client").then((mod) => ({
		default: mod.KanbanBoardClient,
	})),
);

interface KanbanBoardWrapperProps {
	tasks: RoadmapTask[];
	columns: KanbanColumnConfig[];
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

// Skeleton for SSR fallback
function KanbanBoardSkeleton({ columns }: { columns: KanbanColumnConfig[] }) {
	return (
		<div className="grid grid-cols-1 gap-responsive md:grid-cols-3">
			{columns.map((col) => (
				<div
					key={col.id}
					className="min-h-[500px] rounded-2xl bg-gray-50/50 p-4"
				>
					<div className="mb-4 flex items-center justify-between">
						<div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
						<div className="h-6 w-8 animate-pulse rounded bg-gray-200" />
					</div>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton loader
								key={i}
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

export function KanbanBoard({ tasks, columns }: KanbanBoardWrapperProps) {
	return (
		<ClientOnly fallback={<KanbanBoardSkeleton columns={columns} />}>
			{() => (
				<Suspense fallback={<KanbanBoardSkeleton columns={columns} />}>
					<KanbanBoardClient tasks={tasks} columns={columns} />
				</Suspense>
			)}
		</ClientOnly>
	);
}
