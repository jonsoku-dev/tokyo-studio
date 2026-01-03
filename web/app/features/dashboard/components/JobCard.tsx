import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import type { JobRecommendation } from "../domain/dashboard.types";

interface JobCardProps {
	job: JobRecommendation;
	index: number;
}

export function JobCard({ job, index }: JobCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1, duration: 0.3 }}
			whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
			className="group flex cursor-pointer gap-4 rounded-xl border border-gray-200 bg-white p-responsive shadow-sm transition-all"
		>
			<div className="flex min-w-[40px] flex-col items-center gap-1 pt-1">
				<div className="center body-sm h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 shadow-inner">
					{job.company[0]}
				</div>
			</div>
			<div className="flex-1">
				<div className="caption mb-1 flex items-center gap-2">
					<span className="font-medium text-gray-700">{job.company}</span>
					<span>•</span>
					<span>{job.location}</span>
					{job.isVisaSponsored && (
						<>
							<span>•</span>
							<span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-600">
								Visa OK
							</span>
						</>
					)}
				</div>
				<h3 className="heading-5 transition-colors group-hover:text-primary-600">
					{job.title}
				</h3>
				<div className="cluster-sm mt-3">
					{job.tags.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium text-gray-600 text-xs"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
			<div className="flex items-center">
				<motion.button
					whileTap={{ scale: 0.9 }}
					type="button"
					className="rounded-full p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
				>
					<span className="sr-only">Save</span>
					<Bookmark className="h-5 w-5" />
				</motion.button>
			</div>
		</motion.div>
	);
}
