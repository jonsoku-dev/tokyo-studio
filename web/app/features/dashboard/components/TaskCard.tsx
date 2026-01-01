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
				"bg-white p-4 rounded-xl shadow-sm border transition-colors flex gap-4",
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
						className="w-5 h-5 text-primary-500 rounded-md focus:ring-primary-500 border-gray-300 cursor-pointer transition-all hover:scale-110"
					/>
				</fetcher.Form>
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2 caption mb-1">
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
						"text-lg font-medium transition-colors",
						isCompleted
							? "text-gray-400 line-through decoration-gray-300"
							: "text-gray-900",
					)}
				>
					{task.title}
				</h3>
				<p
					className={clsx(
						"text-sm mt-1 line-clamp-2",
						isCompleted ? "text-gray-300" : "text-gray-500",
					)}
				>
					{task.description}
				</p>
				<div className="mt-3 flex items-center gap-2">
					<span
						className={clsx(
							"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
							task.priority === "urgent" && !isCompleted
								? "bg-red-50 text-red-700 border-red-100"
								: "bg-gray-50 text-gray-600 border-gray-100",
						)}
					>
						{task.priority}
					</span>
				</div>
			</div>
		</motion.div>
	);
}
