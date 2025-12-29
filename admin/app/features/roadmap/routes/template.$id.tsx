/**
 * Admin Template Edit Page
 * /admin/roadmap/templates/:id
 */
import { data, redirect } from "react-router";
import { TemplateForm } from "../components/TemplateForm";
import { getTemplate, updateTemplate } from "../services/admin-roadmap.server";
import { requireAdmin } from "~/features/auth/utils/session.server";
import type { Route } from "./+types/template.$id";

// ============================================
// Loader
// ============================================
export async function loader({ params, request }: Route.LoaderArgs) {
	await requireAdmin(request);
	const template = await getTemplate(params.id);

	if (!template) {
		throw new Response("Template not found", { status: 404 });
	}

	return data({ template });
}

// ============================================
// Action
// ============================================
export async function action({ request, params }: Route.ActionArgs) {
	const adminId = await requireAdmin(request);
	const formData = await request.formData();
	const templateData = {
		title: formData.get("title") as string,
		description: formData.get("description") as string,
		category: formData.get("category") as string,
		estimatedMinutes: Number(formData.get("estimatedMinutes")) || 60,
		priority: (formData.get("priority") as string) || "normal",
		targetJobFamilies: parseJsonArray(formData.get("targetJobFamilies")),
		targetLevels: parseJsonArray(formData.get("targetLevels")),
		targetJpLevels: parseJsonArray(formData.get("targetJpLevels")),
		targetCities: parseJsonArray(formData.get("targetCities")),
		isActive: formData.get("isActive") === "on",
	};

	await updateTemplate(params.id, templateData, adminId);
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
export default function TemplateEditPage({ loaderData }: Route.ComponentProps) {
	const { template } = loaderData;

	return (
		<div className="p-6">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					Edit Template: {template.title}
				</h1>
				<TemplateForm template={template} />
			</div>
		</div>
	);
}
