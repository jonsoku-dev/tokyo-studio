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
			className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all cursor-pointer flex gap-4 group"
		>
			<div className="flex flex-col items-center gap-1 pt-1 min-w-[40px]">
				<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 center body-sm shadow-inner">
					{job.company[0]}
				</div>
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2 caption mb-1">
					<span className="font-medium text-gray-700">{job.company}</span>
					<span>•</span>
					<span>{job.location}</span>
					{job.isVisaSponsored && (
						<>
							<span>•</span>
							<span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
								Visa OK
							</span>
						</>
					)}
				</div>
				<h3 className="heading-5 group-hover:text-primary-600 transition-colors">
					{job.title}
				</h3>
				<div className="mt-3 cluster-sm">
					{job.tags.map((tag) => (
						<span
							key={tag}
							className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100"
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
					className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
				>
					<span className="sr-only">Save</span>
					<Bookmark className="w-5 h-5" />
				</motion.button>
			</div>
		</motion.div>
	);
}
