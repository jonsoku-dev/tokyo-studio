import { arrayMove } from "@dnd-kit/sortable";
import type {
	SettlementPhase,
	SettlementTaskTemplate,
	SettlementTemplate,
} from "@itcom/db/schema";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EditorState {
	template: SettlementTemplate | null;
	tasks: SettlementTaskTemplate[];
	phases: SettlementPhase[];
	isDirty: boolean;
	isSaving: boolean;

	// Actions
	setInitialData: (
		template: SettlementTemplate,
		tasks: SettlementTaskTemplate[],
		phases: SettlementPhase[],
	) => void;

	// Task CRUD
	addTask: (
		phaseId: string,
		title: string,
		category: string,
		dayOffset: number,
	) => void;
	updateTask: (
		taskId: string,
		updates: Partial<SettlementTaskTemplate>,
	) => void;
	deleteTask: (taskId: string) => void;

	// Reorder
	reorderTasks: (activeId: string, overId: string) => void;

	// Meta
	updateTemplate: (updates: Partial<SettlementTemplate>) => void;
	setSaving: (saving: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
	immer((set) => ({
		template: null,
		tasks: [],
		phases: [],
		isDirty: false,
		isSaving: false,

		setInitialData: (template, tasks, phases) =>
			set((state) => {
				state.template = template;
				state.tasks = tasks;
				state.phases = phases;
				state.isDirty = false;
			}),

		addTask: (phaseId, title, category, dayOffset) =>
			set((state) => {
				if (!state.template) return;
				const phaseTasks = state.tasks.filter((t) => t.phaseId === phaseId);
				const maxOrder = Math.max(...phaseTasks.map((t) => t.orderIndex), -1);

				state.tasks.push({
					id: `new-${nanoid()}`, // Temp ID
					templateId: state.template.id,
					title,
					category: category,
					phaseId,
					dayOffset,
					orderIndex: maxOrder + 1,
					description: null,
					requiredDocuments: null,
					isRequired: false,
					formTemplateUrl: null,
					timePhase: null, // Legacy types
					officialUrl: null, // Legacy types -> Schema defines them as nullable, so null is valid.
					tips: null, // Legacy types
					createdAt: new Date(),
					updatedAt: new Date(),
					slug: null,
					titleKo: null,
					titleJa: null,
					titleEn: null, // Wait, Schema doesn't have titleEn for TaskTemplate?
					instructionsKo: null,
					instructionsJa: null,
					estimatedMinutes: 60,
				} as unknown as SettlementTaskTemplate); // Casting because immer draft vs actual type checks can be tricky with partials, but actually better to just fill mandatory fields.
				state.isDirty = true;
			}),

		updateTask: (taskId, updates) =>
			set((state) => {
				const task = state.tasks.find((t) => t.id === taskId);
				if (task) {
					Object.assign(task, updates);
					state.isDirty = true;
				}
			}),

		deleteTask: (taskId) =>
			set((state) => {
				state.tasks = state.tasks.filter((t) => t.id !== taskId);
				state.isDirty = true;
			}),

		reorderTasks: (activeId, overId) =>
			set((state) => {
				const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
				const overIndex = state.tasks.findIndex((t) => t.id === overId);

				if (activeIndex !== -1 && overIndex !== -1) {
					const activeTask = state.tasks[activeIndex];
					const overTask = state.tasks[overIndex];

					// Cross-phase move check
					if (activeTask.phaseId !== overTask.phaseId) {
						activeTask.phaseId = overTask.phaseId;
					}

					state.tasks = arrayMove(state.tasks, activeIndex, overIndex);

					// Re-calculate orderIndex for the affected phase(s) to be safe/clean?
					// Or just let array order imply it?
					// For backend sync, we will likely send the whole list or re-index on server.
					// But to keep UI sorted, we might need to update orderIndex locally if we depend on it for sorting.
					// In `editor.$templateId.tsx`, we sort by `orderIndex`.
					// So we MUST update `orderIndex` here to reflect the new array order.

					// Actually `arrayMove` changes the array position.
					// If we rely on `tasks.filter(...).sort(...)`, we need `orderIndex` to match array position.
					// Let's re-normalize distinct phase tasks.
					// The tasks array order has changed. Use it to update orderIndex for all tasks in affected phases.

					const phases = new Set(state.tasks.map((t) => t.phaseId));
					phases.forEach((pId) => {
						const phaseTasks = state.tasks.filter((t) => t.phaseId === pId);
						phaseTasks.forEach((t, idx) => {
							const taskInState = state.tasks.find((x) => x.id === t.id);
							if (taskInState) taskInState.orderIndex = idx;
						});
					});

					state.isDirty = true;
				}
			}),

		updateTemplate: (updates) =>
			set((state) => {
				if (state.template) {
					Object.assign(state.template, updates);
					state.isDirty = true;
				}
			}),

		setSaving: (saving) =>
			set((state) => {
				state.isSaving = saving;
			}),
	})),
);
