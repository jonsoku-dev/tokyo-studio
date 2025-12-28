import { redirect } from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { requireUserId } from "../../auth/utils/session.server";
import { DiagnosisWizard } from "../components/DiagnosisWizard";
import { diagnosisService } from "../domain/diagnosis.service.server";
import type { Route } from "./+types/diagnosis";

export function meta() {
	return [{ title: "Onboarding Diagnosis - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const existingProfile = await diagnosisService.getProfile(userId);

	// If profile exists, we can either redirect to result or allow editing.
	// For MVP, we pass it as default values.
	return { existingProfile };
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const data = {
		userId,
		jobFamily: String(formData.get("jobFamily")),
		level: String(formData.get("level")),
		jpLevel: String(formData.get("jpLevel")),
		enLevel: String(formData.get("enLevel")),
		targetCity: String(formData.get("targetCity")),
	};

	// Upsert profile
	const existing = await diagnosisService.getProfile(userId);
	if (existing) {
		await diagnosisService.updateProfile(userId, data);
	} else {
		await diagnosisService.createProfile(data);
	}

	// Recommendations could be calculated here or in a separate step/page.
	// For MVP, redirect to dashboard or a result page.
	return redirect("/diagnosis/result");
}

export default function Diagnosis({ loaderData }: Route.ComponentProps) {
	return (
		<Shell>
			<div className="py-10">
				<div className="text-center mb-10">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Let's build your strategy
					</h1>
					<p className="text-gray-600">
						Answer 3 simple questions to get a personalized roadmap.
					</p>
				</div>
				<DiagnosisWizard defaultValues={loaderData.existingProfile} />
			</div>
		</Shell>
	);
}
