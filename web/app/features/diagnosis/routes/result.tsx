import type { SelectProfile } from "@itcom/db/schema";
import { ArrowRight, Award, Briefcase, CheckCircle, Globe } from "lucide-react";
import { Link } from "react-router";

import { requireUserId } from "../../auth/utils/session.server";
import { diagnosisService } from "../domain/diagnosis.service.server";
import type { Route } from "./+types/result";

export function meta() {
	return [{ title: "Diagnosis Result - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const profile = await diagnosisService.getProfile(userId);

	if (!profile) {
		throw new Response("Profile not found", { status: 404 });
	}

	const { items, strategy } =
		diagnosisService.calculateRecommendations(profile);

	return { profile, items, strategy };
}

// Define types for recommendation items
interface RecommendationItem {
	title: string;
	type: string;
	description: string;
	tags?: string[];
}

export default function DiagnosisResult({ loaderData }: Route.ComponentProps) {
	const { profile, items, strategy } = loaderData as {
		profile: SelectProfile;
		items: RecommendationItem[];
		strategy: string;
	};

	return (
		<div className="stack-lg">
			{/* Header */}
			<div className="stack text-center">
				<div className="inline-center mb-4 h-16 w-16 rounded-full bg-accent-100 text-accent-600">
					<CheckCircle className="h-8 w-8" />
				</div>
				<h1 className="heading-2 text-gray-900">
					Your Personal Strategy: {strategy.replace("_", " ")}
				</h1>
				<p className="text-gray-600 text-xl">
					Based on your profile as a{" "}
					<span className="heading-5">
						{profile.level} {profile.jobFamily}
					</span>{" "}
					engineer.
				</p>
			</div>

			{/* Recommendations Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				{items.map((item, _idx) => (
					<div
						key={item.title}
						className="card-sm border border-gray-200 p-6 transition-shadow hover:shadow-md"
					>
						<div className="flex items-start gap-4">
							<div className="rounded-lg bg-primary-50 p-3 text-primary-600">
								{item.type === "channel" && <Globe className="h-6 w-6" />}
								{item.type === "visa" && <Award className="h-6 w-6" />}
								{item.type === "action" && <Briefcase className="h-6 w-6" />}
							</div>
							<div>
								<h3 className="heading-5 mb-1">{item.title}</h3>
								<p className="mb-3 text-gray-600 text-sm">{item.description}</p>
								{item.tags && (
									<div className="cluster-sm">
										{item.tags.map((tag) => (
											<span
												key={tag}
												className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 text-xs"
											>
												#{tag}
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Next Steps CTA */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-amber-500 p-8 text-white">
				<div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
					<div>
						<h2 className="heading-3 mb-2">Ready to start?</h2>
						<p className="text-primary-50">
							Your roadmap has been generated based on this strategy.
						</p>
					</div>
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-primary-600 transition-colors hover:bg-gray-50"
					>
						Go to Dashboard <ArrowRight className="h-4 w-4" />
					</Link>
				</div>
				{/* Decorational circles */}
				<div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
			</div>
		</div>
	);
}
