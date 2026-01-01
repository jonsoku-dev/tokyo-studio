import type { SelectMentorApplication } from "@itcom/db/schema";
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router";

interface MentorApplicationStatusProps {
	application?: SelectMentorApplication | null;
}

export function MentorApplicationStatus({
	application,
}: MentorApplicationStatusProps) {
	if (!application) {
		return (
			<Link
				to="/mentoring/apply"
				className="block rounded-xl border border-primary-200 border-dashed bg-primary-50 p-4 transition-colors hover:bg-primary-100"
			>
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-primary-900">Become a Mentor</h3>
						<p className="mt-1 text-primary-700 text-sm">
							Share your expertise and earn by mentoring others
						</p>
					</div>
					<ArrowRight className="h-5 w-5 flex-shrink-0 text-primary-600" />
				</div>
			</Link>
		);
	}

	const statusConfig = {
		pending: {
			icon: Clock,
			color: "bg-yellow-50 border-yellow-200",
			textColor: "text-yellow-900",
			subColor: "text-yellow-700",
			badge: "bg-yellow-100 text-yellow-800",
			message: "Your application is being reviewed",
		},
		under_review: {
			icon: Clock,
			color: "bg-primary-50 border-primary-200",
			textColor: "text-primary-900",
			subColor: "text-primary-700",
			badge: "bg-primary-100 text-primary-800",
			message: "Our team is actively reviewing your application",
		},
		approved: {
			icon: CheckCircle2,
			color: "bg-accent-50 border-accent-200",
			textColor: "text-accent-900",
			subColor: "text-accent-700",
			badge: "bg-accent-100 text-accent-800",
			message: "Congratulations! You are now a mentor",
		},
		rejected: {
			icon: AlertCircle,
			color: "bg-red-50 border-red-200",
			textColor: "text-red-900",
			subColor: "text-red-700",
			badge: "bg-red-100 text-red-800",
			message: application.rejectionReason
				? `Application rejected: ${application.rejectionReason.substring(0, 100)}...`
				: "Your application was not approved",
		},
		cancelled: {
			icon: AlertCircle,
			color: "bg-gray-50 border-gray-200",
			textColor: "text-gray-900",
			subColor: "text-gray-700",
			badge: "bg-gray-100 text-gray-800",
			message: "Your application was cancelled",
		},
	};

	const config = statusConfig[application.status as keyof typeof statusConfig];
	const Icon = config.icon;

	return (
		<div className={`rounded-xl border p-4 ${config.color} stack-sm`}>
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3">
					<Icon
						className={`mt-0.5 h-5 w-5 ${config.textColor} flex-shrink-0`}
					/>
					<div>
						<h3 className={`font-semibold ${config.textColor}`}>
							Mentor Application
						</h3>
						<p className={`text-sm ${config.subColor} mt-1`}>
							{config.message}
						</p>
					</div>
				</div>
				<span
					className={`whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-xs ${config.badge}`}
				>
					{application.status.replace("_", " ")}
				</span>
			</div>

			{application.status === "pending" ||
			application.status === "under_review" ? (
				<p className={`text-xs ${config.subColor}`}>
					Submitted on {new Date(application.createdAt).toLocaleDateString()}
				</p>
			) : application.status === "approved" ? (
				<div className="flex gap-2 pt-2">
					<Link
						to="/mentoring/settings"
						className="rounded-lg bg-accent-100 px-3 py-1.5 font-medium text-accent-700 text-sm transition-colors hover:bg-accent-200"
					>
						Complete Profile
					</Link>
				</div>
			) : application.status === "rejected" ? (
				(() => {
					const rejectedDate = new Date(application.rejectedAt || Date.now());
					const reapplyDate = new Date(
						rejectedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
					);
					const canReapply = new Date() >= reapplyDate;

					return (
						<div className="stack-sm pt-2">
							<p className={`text-xs ${config.subColor}`}>
								You can reapply on{" "}
								<strong>{reapplyDate.toLocaleDateString()}</strong>
							</p>
							{canReapply && (
								<Link
									to="/mentoring/apply"
									className="inline-block rounded-lg bg-red-100 px-3 py-1.5 font-medium text-red-700 text-sm transition-colors hover:bg-red-200"
								>
									Reapply Now
								</Link>
							)}
						</div>
					);
				})()
			) : null}
		</div>
	);
}
