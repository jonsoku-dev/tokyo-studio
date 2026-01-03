/**
 * Admin Template Create Page
 * /admin/roadmap/templates/new
 */
import { data, redirect } from "react-router";
import { requireAdmin } from "~/features/auth/utils/session.server";
import { TemplateForm } from "../components/TemplateForm";
import { createTemplate } from "../services/admin-roadmap.server";
import type { Route } from "./+types/template.new";

// ============================================
// ============================================
// Meta
// ============================================
export function meta() {
	return [{ title: "New Roadmap Template | Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireAdmin(request);
	return null;
}

// ============================================
// Action
// ============================================
export async function action({ request }: Route.ActionArgs) {
	const adminId = await requireAdmin(request);
	const formData = await request.formData();

	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const category = formData.get("category") as string;
	const estimatedMinutes = Number(formData.get("estimatedMinutes"));
	const priority = formData.get("priority") as string;
	const isActive = formData.get("isActive") === "on";

	// Targeting
	const targetJobFamilies = formData.getAll("targetJobFamilies") as string[];
	const targetLevels = formData.getAll("targetLevels") as string[];
	const targetJpLevels = formData.getAll("targetJpLevels") as string[];
	const targetCities = formData.getAll("targetCities") as string[];

	// Validation (re-adding this as it was likely an oversight in the provided diff's truncation)
	if (!title || !description || !category) {
		return data(
			{ error: "Title, description, and category are required" },
			{ status: 400 },
		);
	}

	await createTemplate(
		{
			title,
			description,
			category,
			estimatedMinutes,
			priority,
			targetJobFamilies,
			targetLevels,
			targetJpLevels,
			targetCities,
			isActive,
		},
		adminId,
	);

	return redirect("/roadmap/templates");
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

// ============================================
// Component
// ============================================
export default function TemplateNewPage() {
	return (
		<div className="p-responsive">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					Create New Template
				</h1>
				<TemplateForm />
			</div>
		</div>
	);
}
