import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { PipelineItem, PipelineStatus } from "../domain/pipeline.types";

interface PipelineStore {
	// State
	items: PipelineItem[];

	// Actions
	setItems: (items: PipelineItem[]) => void;
	updateItemStage: (
		itemId: string,
		stage: PipelineStatus,
		orderIndex?: number,
	) => void;
	resetStore: () => void;
}

/**
 * Pipeline Zustand Store
 *
 * Manages:
 * - Current pipeline item state (local, not synced to server yet)
 * - Stage transitions tracking
 */
export const usePipelineStore = create<PipelineStore>()(
	subscribeWithSelector((set) => ({
		// Initial state
		items: [],

		// Actions
		setItems: (items: PipelineItem[]) => {
			console.log("[Pipeline Store] setItems:", items.length, "items");
			set({ items });
		},

		updateItemStage: (
			itemId: string,
			stage: PipelineStatus,
			orderIndex?: number,
		) => {
			console.log(
				"[Pipeline Store] updateItemStage:",
				itemId,
				"->",
				stage,
				"at index:",
				orderIndex,
			);
			set((state: PipelineStore) => {
				const updatedItems = state.items.map((item) =>
					item.id === itemId
						? {
								...item,
								stage,
							}
						: item,
				);

				console.log("[Pipeline Store] Items updated");
				return { items: updatedItems };
			});
		},

		resetStore: () => {
			console.log("[Pipeline Store] resetStore");
			set({ items: [] });
		},
	})),
);

/**
 * Selectors for optimized re-renders
 */
export const selectPipelineItems = (state: PipelineStore) => state.items;
