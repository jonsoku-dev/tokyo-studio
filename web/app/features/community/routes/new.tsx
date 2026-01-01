import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";

import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { requireVerifiedEmail } from "../../auth/services/require-verified-email.server";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { communityService } from "../domain/community.service.server";
import { CreateCommunityPostSchema } from "../domain/community.types";
import type { Route } from "./+types/new";

export function meta() {
	return [{ title: "Write Post - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireVerifiedEmail(request);
	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const user = await requireVerifiedEmail(request);
	const formData = await request.formData();
	const title = String(formData.get("title"));
	const content = String(formData.get("content"));
	const category = String(formData.get("category"));

	const result = CreateCommunityPostSchema.safeParse({
		title,
		content,
		category,
		authorId: user.id,
	});

	if (!result.success) {
		return { error: result.error.issues[0].message };
	}

	await communityService.createPost(result.data);
	return redirect("/community");
}

export default function NewPost({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div>
			<div className="mb-6">
				<h1 className="heading-3">Create a Post</h1>
				<p className="text-gray-500 text-sm">
					Share your experience or ask a question.
				</p>
			</div>

			<div className="card-sm border border-gray-200 p-6">
				<TabGroup>
					<TabList className="mb-6 flex gap-4 border-gray-200 border-b">
						<Tab
							className={({ selected }) =>
								`border-b-2 pb-2 font-medium text-sm focus:outline-none ${
									selected
										? "border-primary-500 text-primary-600"
										: "link-subtle border-transparent"
								}`
							}
						>
							Ask Question (QnA)
						</Tab>
						<Tab
							className={({ selected }) =>
								`border-b-2 pb-2 font-medium text-sm focus:outline-none ${
									selected
										? "border-primary-500 text-primary-600"
										: "link-subtle border-transparent"
								}`
							}
						>
							Write Review
						</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<PostForm
								category="qna"
								error={actionData?.error}
								isSubmitting={isSubmitting}
							/>
						</TabPanel>
						<TabPanel>
							<PostForm
								category="review"
								error={actionData?.error}
								isSubmitting={isSubmitting}
							/>
						</TabPanel>
					</TabPanels>
				</TabGroup>
			</div>
		</div>
	);
}

function PostForm({
	category,
	error,
	isSubmitting,
}: {
	category: string;
	error?: string;
	isSubmitting: boolean;
}) {
	const [content, setContent] = useState("");

	return (
		<Form method="post" className="stack-md">
			<input type="hidden" name="category" value={category} />

			{error && (
				<div className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
					{error}
				</div>
			)}

			<Input
				id="title"
				name="title"
				label="Title"
				placeholder={
					category === "review"
						? "e.g. Frontend Interview at LINE Yahoo"
						: "e.g. How to prepare for visa interview?"
				}
				required
			/>

			<div>
				<label
					htmlFor="content"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Content
				</label>
				<MarkdownEditor
					value={content}
					onChange={setContent}
					label="Content"
					placeholder={
						category === "review"
							? "Share your interview process, questions asked, and outcome..."
							: "Describe your question in detail..."
					}
					rows={12}
				/>
				<input type="hidden" name="content" value={content} />
			</div>

			<div className="flex justify-end gap-3">
				<Link
					to="/community"
					className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
				>
					Cancel
				</Link>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Posting..." : "Post"}
				</Button>
			</div>
		</Form>
	);
}
