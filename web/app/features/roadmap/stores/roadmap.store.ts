import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
	RoadmapCategory,
	RoadmapProgress,
} from "../services/roadmap.server";

// Type for RoadmapTask (copied from schema since it's not exported)
interface RoadmapTask {
	id: string;
	userId: string;
	templateId: string | null;
	title: string;
	description: string;
	category: string;
	estimatedMinutes: number;
	priority: string;
	kanbanColumn: string;
	orderIndex: number;
	isCustom: boolean;
	createdAt: Date;
	updatedAt: Date;
	completedAt: Date | null;
}

interface RoadmapStore {
	// State
	tasks: RoadmapTask[];
	progress: RoadmapProgress;

	// Actions
	setTasks: (tasks: RoadmapTask[]) => void;
	updateTaskColumn: (taskId: string, column: string, orderIndex?: number) => void;
	calculateProgress: () => RoadmapProgress;
	setProgress: (progress: RoadmapProgress) => void;
	resetStore: () => void;
}

/**
 * Calculate progress statistics from tasks
 */
function calculateProgressFromTasks(tasks: RoadmapTask[]): RoadmapProgress {
	const categories: RoadmapCategory[] = [
		"Learning",
		"Application",
		"Preparation",
		"Settlement",
	];

	const byCategory = {} as Record<
		RoadmapCategory,
		{ total: number; completed: number; percent: number }
	>;

	for (const cat of categories) {
		const catTasks = tasks.filter((t) => t.category === cat);
		const completed = catTasks.filter(
			(t) => t.kanbanColumn === "completed",
		).length;
		byCategory[cat] = {
			total: catTasks.length,
			completed,
			percent:
				catTasks.length > 0
					? Math.round((completed / catTasks.length) * 100)
					: 0,
		};
	}

	const total = tasks.length;
	const completed = tasks.filter((t) => t.kanbanColumn === "completed").length;

	return {
		total,
		completed,
		percent: total > 0 ? Math.round((completed / total) * 100) : 0,
		byCategory,
	};
}

/**
 * Roadmap Zustand Store
 *
 * Manages:
 * - Current task state (local, not synced to server yet)
 * - Real-time progress calculation
 * - Pending changes tracking
 */
export const useRoadmapStore = create<RoadmapStore>()(
	subscribeWithSelector((set, get) => ({
		// Initial state
		tasks: [],
		progress: {
			total: 0,
			completed: 0,
			percent: 0,
			byCategory: {
				Learning: { total: 0, completed: 0, percent: 0 },
				Application: { total: 0, completed: 0, percent: 0 },
				Preparation: { total: 0, completed: 0, percent: 0 },
				Settlement: { total: 0, completed: 0, percent: 0 },
			},
		},

		// Actions
		setTasks: (tasks: RoadmapTask[]) => {
			console.log("[Store] setTasks:", tasks.length, "tasks");
			const progress = calculateProgressFromTasks(tasks);
			set({ tasks, progress });
		},

		updateTaskColumn: (
			taskId: string,
			column: string,
			orderIndex?: number,
		) => {
			console.log(
				"[Store] updateTaskColumn:",
				taskId,
				"->",
				column,
				"at index:",
				orderIndex,
			);
			set((state: RoadmapStore) => {
				const updatedTasks = state.tasks.map((task) =>
					task.id === taskId
						? {
								...task,
								kanbanColumn: column,
								orderIndex: orderIndex ?? task.orderIndex,
							}
						: task,
				);

				const progress = calculateProgressFromTasks(updatedTasks);
				console.log("[Store] Progress updated:", progress.percent, "%");

				return { tasks: updatedTasks, progress };
			});
		},

		calculateProgress: () => {
			const state = get();
			return calculateProgressFromTasks(state.tasks);
		},

		setProgress: (progress: RoadmapProgress) => {
			console.log("[Store] setProgress:", progress.percent, "%");
			set({ progress });
		},

		resetStore: () => {
			console.log("[Store] resetStore");
			set({
				tasks: [],
				progress: {
					total: 0,
					completed: 0,
					percent: 0,
					byCategory: {
						Learning: { total: 0, completed: 0, percent: 0 },
						Application: { total: 0, completed: 0, percent: 0 },
						Preparation: { total: 0, completed: 0, percent: 0 },
						Settlement: { total: 0, completed: 0, percent: 0 },
					},
				},
			});
		},
	})),
);

/**
 * Selectors for optimized re-renders
 */
export const selectRoadmapTasks = (state: RoadmapStore) => state.tasks;
export const selectRoadmapProgress = (state: RoadmapStore) => state.progress;
export const selectRoadmapProgressPercent = (state: RoadmapStore) =>
	state.progress.percent;
export const selectRoadmapProgressByCategory = (state: RoadmapStore) =>
	state.progress.byCategory;
