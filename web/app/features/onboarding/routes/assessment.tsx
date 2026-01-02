import { redirect } from "react-router";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { requireUserId } from "../../auth/utils/session.server";
import { AssessmentWizard } from "../components/AssessmentWizard";
import { profileService } from "../domain/profile.service.server";
import type { Route } from "./+types/assessment";

export function meta() {
	return [{ title: "Career Assessment - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const existingProfile = await profileService.getProfile(userId);

	// If profile exists, we can either redirect to result or allow editing.
	// For MVP, we pass it as default values.
	return { existingProfile };
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const rawDegree = String(formData.get("hardConstraints"));
	let hardConstraints: {
		degree?: "bachelor" | "associate" | "none";
		visaStatus?: "none" | "student" | "working" | "spouse" | "hsp";
	} = { degree: "none", visaStatus: "none" };

	try {
		const parsed = JSON.parse(rawDegree);
		hardConstraints = {
			degree: parsed.degree,
			visaStatus: parsed.visaStatus,
		};
	} catch (e) {
		// Fallback or log error
		console.error("Failed to parse hardConstraints", e);
	}

	const data = {
		userId,
		jobFamily: String(formData.get("jobFamily")),
		level: String(formData.get("level")),
		years: Number(formData.get("years")), // parsing number
		jpLevel: String(formData.get("jpLevel")),
		enLevel: String(formData.get("enLevel")),
		targetCity: String(formData.get("targetCity")),
		careerTimeline: String(formData.get("careerTimeline")),
		residence: String(formData.get("residence")),

		// Arrays from FormData
		techStack: formData.getAll("techStack") as string[],
		workValues: formData.getAll("workValues") as string[],
		concerns: formData.getAll("concerns") as string[],

		// JSON Parsed
		hardConstraints,
	};

	// Upsert profile
	await profileService.updateProfile(userId, data);

	// Redirect to result page
	return redirect("/onboarding/result");
}

export default function OnboardingAssessment({
	loaderData,
}: Route.ComponentProps) {
	return (
		<div className="stack-lg mx-auto max-w-2xl">
			<PageHeader
				title="나만의 커리어 전략 수립"
				description="3가지 간단한 질문에 답하고 맞춤형 로드맵을 받아보세요."
				className="text-center"
			/>
			<AssessmentWizard defaultValues={loaderData.existingProfile} />
		</div>
	);
}
