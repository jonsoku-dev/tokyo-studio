import type { SelectProfile } from "@itcom/db/schema";
import { ArrowRight, Award, Briefcase, CheckCircle, Globe } from "lucide-react";
import { Link } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
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
		<Shell>
			<div className="max-w-4xl mx-auto space-y-8 py-8">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
						<CheckCircle className="w-8 h-8" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">
						Your Personal Strategy: {strategy.replace("_", " ")}
					</h1>
					<p className="text-xl text-gray-600">
						Based on your profile as a{" "}
						<span className="font-semibold text-gray-900">
							{profile.level} {profile.jobFamily}
						</span>{" "}
						engineer.
					</p>
				</div>

				{/* Recommendations Grid */}
				<div className="grid md:grid-cols-2 gap-6">
					{items.map((item, _idx) => (
						<div
							key={item.title}
							className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex items-start gap-4">
								<div className="p-3 bg-orange-50 rounded-lg text-orange-600">
									{item.type === "channel" && <Globe className="w-6 h-6" />}
									{item.type === "visa" && <Award className="w-6 h-6" />}
									{item.type === "action" && <Briefcase className="w-6 h-6" />}
								</div>
								<div>
									<h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
									<p className="text-gray-600 text-sm mb-3">
										{item.description}
									</p>
									{item.tags && (
										<div className="flex flex-wrap gap-2">
											{item.tags.map((tag) => (
												<span
													key={tag}
													className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
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
				<div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white relative overflow-hidden">
					<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
						<div>
							<h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
							<p className="text-orange-50">
								Your roadmap has been generated based on this strategy.
							</p>
						</div>
						<Link
							to="/"
							className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
						>
							Go to Dashboard <ArrowRight className="w-4 h-4" />
						</Link>
					</div>
					{/* Decorational circles */}
					<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
					<div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
				</div>
			</div>
		</Shell>
	);
}
