import { AlertTriangle } from "lucide-react";
import { useFetcher } from "react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import type { PipelineItem } from "../domain/pipeline.types";

interface DeletePipelineItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: PipelineItem;
}

export function DeletePipelineItemModal({
	isOpen,
	onClose,
	item,
}: DeletePipelineItemModalProps) {
	const fetcher = useFetcher();
	const isSubmitting = fetcher.state !== "idle";

	// Close on success
	if (fetcher.state === "idle" && fetcher.data?.success) {
		setTimeout(onClose, 0);
	}

	const handleDelete = () => {
		fetcher.submit(
			{ intent: "delete", itemId: item.id },
			{ method: "POST", action: "/api/pipeline/items/update" },
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Application</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center gap-4 py-4 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
						<AlertTriangle className="h-6 w-6" />
					</div>
					<div className="space-y-1">
						<p className="font-medium text-lg">Are you sure?</p>
						<p className="text-gray-500 text-sm">
							This will permanently delete the application for{" "}
							<span className="font-semibold text-gray-900">
								{item.company}
							</span>{" "}
							- <span className="text-gray-700">{item.position}</span>.
						</p>
					</div>
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="flex-1 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isSubmitting}
						className="flex-1 rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
					>
						{isSubmitting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
