import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import type { KanbanColumnConfig, KanbanTask } from "./kanban.types";

// Lazy load the client-only KanbanBoard
const KanbanBoardClient = lazy(() =>
	import("./KanbanBoard.client").then((mod) => ({ default: mod.KanbanBoard })),
);

interface KanbanBoardWrapperProps {
	tasks: KanbanTask[];
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
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{columns.map((col) => (
				<div
					key={col.id}
					className="bg-gray-50/50 rounded-2xl p-4 min-h-[500px]"
				>
					<div className="flex items-center justify-between mb-4">
						<div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
						<div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
					</div>
					<div className="stack-sm">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="bg-white rounded-lg border border-gray-200 p-3 h-24 animate-pulse"
							>
								<div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
								<div className="h-3 w-1/2 bg-gray-100 rounded" />
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
