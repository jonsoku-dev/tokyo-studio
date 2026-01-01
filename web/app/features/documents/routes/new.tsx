import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";

import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { requireUserId } from "../../auth/utils/session.server";
import { FileDropzone } from "../components/FileDropzone";
import { documentService } from "../domain/documents.service.server";
import { CreateDocumentSchema } from "../domain/documents.types";
import type { Route } from "./+types/new";

export function meta() {
	return [{ title: "New Document - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireUserId(request);
	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const title = String(formData.get("title"));
	const type = String(formData.get("type"));
	const url = String(formData.get("url")); // In real app, this would be the bucket URL

	const result = CreateDocumentSchema.safeParse({
		title,
		type,
		url: url || undefined, // Zod handles optional
		userId,
		status: "draft",
	});

	if (!result.success) {
		return { error: result.error.issues[0].message };
	}

	await documentService.createDocument(result.data);
	return redirect("/documents");
}

export default function NewDocument({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const [file, setFile] = useState<File | null>(null);

	return (
		<div className="mx-auto max-w-2xl">
			<div className="mb-6">
				<h1 className="heading-3">Add New Document</h1>
				<p className="text-gray-500 text-sm">
					Upload or link your resume, CV, or portfolio.
				</p>
			</div>

			<div className="card-sm border border-gray-200 p-6">
				<Form method="post" className="stack-md">
					{actionData?.error && (
						<div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
							{actionData.error}
						</div>
					)}

					<Input
						id="title"
						name="title"
						label="Document Title"
						placeholder="e.g. My Resume (EN)"
						required
					/>

					<div>
						<label
							htmlFor="type"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Document Type
						</label>
						<select
							id="type"
							name="type"
							className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
						>
							<option value="Resume">Resume</option>
							<option value="CV">CV</option>
							<option value="Portfolio">Portfolio</option>
						</select>
					</div>

					<div>
						<span className="mb-1 block font-medium text-gray-700 text-sm">
							Upload File
						</span>
						<FileDropzone onFileSelect={setFile} currentFile={file} />
						{/* Hidden input to simulate URL for MVP */}
						<input
							type="hidden"
							name="url"
							value={file ? `https://s3.aws.com/fake-bucket/${file.name}` : ""}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Link
							to="/documents"
							className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
						>
							Cancel
						</Link>
						<Button type="submit" disabled={isSubmitting || !file}>
							{isSubmitting ? "Saving..." : "Save Document"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
