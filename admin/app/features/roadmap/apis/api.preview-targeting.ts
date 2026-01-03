/**
 * Preview Targeting API
 * Returns count and sample of users matching targeting conditions
 */
import { data } from "react-router";

import { requireAdmin } from "~/features/auth/utils/session.server";
import { previewTargeting } from "../services/admin-roadmap.server";
import type { Route } from "./+types/api.preview-targeting";

export async function action({ request }: Route.ActionArgs) {
	await requireAdmin(request);

	const formData = await request.formData();

	const conditions = {
		jobFamilies: parseJsonArray(formData.get("targetJobFamilies")),
		levels: parseJsonArray(formData.get("targetLevels")),
		jpLevels: parseJsonArray(formData.get("targetJpLevels")),
		cities: parseJsonArray(formData.get("targetCities")),
	};

	const result = await previewTargeting(conditions);
	return data(result);
}

function parseJsonArray(value: FormDataEntryValue | null): string[] | null {
	if (!value || value === "") return null;
	try {
		const parsed = JSON.parse(value as string);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
	} catch {
		return null;
	}
}
