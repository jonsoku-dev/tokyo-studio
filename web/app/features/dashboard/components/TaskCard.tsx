import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useFetcher } from "react-router";
import type { DashboardTask } from "../domain/dashboard.types";

interface TaskCardProps {
	task: DashboardTask;
}

export function TaskCard({ task }: TaskCardProps) {
	const fetcher = useFetcher();

	// Optimistic UI: use fetcher submission if available, else current state
	const isCompleted = fetcher.formData
		? fetcher.formData.get("status") === "completed"
		: task.status === "completed";

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
			transition={{ duration: 0.2 }}
			className={clsx(
				"flex gap-4 rounded-xl border bg-white p-responsive shadow-sm transition-colors",
				isCompleted
					? "border-gray-100 bg-gray-50/50"
					: "border-gray-200 hover:border-primary-200",
			)}
		>
			<div className="flex flex-col items-center gap-1 pt-1">
				<fetcher.Form method="post">
					<input type="hidden" name="id" value={task.id} />
					<input
						type="hidden"
						name="status"
						value={isCompleted ? "pending" : "completed"}
					/>
					<input
						type="checkbox"
						checked={isCompleted}
						onChange={(e) => fetcher.submit(e.target.form)}
						className="h-5 w-5 cursor-pointer rounded-md border-gray-300 text-primary-500 transition-all hover:scale-110 focus:ring-primary-500"
					/>
				</fetcher.Form>
			</div>
			<div className="flex-1">
				<div className="caption mb-1 flex items-center gap-2">
					<span className="font-bold text-gray-700">{task.category}</span>
					{task.dueDate && (
						<>
							<span className="text-gray-300">•</span>
							<span className={clsx(isCompleted && "line-through")}>
								{new Date(task.dueDate).toLocaleDateString()}
							</span>
						</>
					)}
				</div>
				<h3
					className={clsx(
						"font-medium text-lg transition-colors",
						isCompleted
							? "text-gray-400 line-through decoration-gray-300"
							: "text-gray-900",
					)}
				>
					{task.title}
				</h3>
				<p
					className={clsx(
						"mt-1 line-clamp-2 text-sm",
						isCompleted ? "text-gray-300" : "text-gray-500",
					)}
				>
					{task.description}
				</p>
				<div className="mt-3 flex items-center gap-2">
					<span
						className={clsx(
							"inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs",
							task.priority === "urgent" && !isCompleted
								? "border-red-100 bg-red-50 text-red-700"
								: "border-gray-100 bg-gray-50 text-gray-600",
						)}
					>
						{task.priority}
					</span>
				</div>
			</div>
		</motion.div>
	);
}
