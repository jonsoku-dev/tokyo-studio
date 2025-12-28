import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import { Shell } from "~/shared/components/layout/Shell";
import { Button } from "~/shared/components/ui/Button";
import { Input } from "~/shared/components/ui/Input";
import { requireUserId } from "../../auth/utils/session.server";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { communityService } from "../domain/community.service.server";
import { CreateCommunityPostSchema } from "../domain/community.types";
import type { Route } from "./+types/new";

export function meta() {
	return [{ title: "Write Post - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireUserId(request);
	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const title = String(formData.get("title"));
	const content = String(formData.get("content"));
	const category = String(formData.get("category"));

	const result = CreateCommunityPostSchema.safeParse({
		title,
		content,
		category,
		authorId: userId,
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
		<Shell>
			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Create a Post</h1>
					<p className="text-gray-500 text-sm">
						Share your experience or ask a question.
					</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<TabGroup>
						<TabList className="flex gap-4 border-b border-gray-200 mb-6">
							<Tab
								className={({ selected }) =>
									`pb-2 text-sm font-medium border-b-2 focus:outline-none ${
										selected
											? "border-orange-500 text-orange-600"
											: "border-transparent text-gray-500 hover:text-gray-700"
									}`
								}
							>
								Ask Question (QnA)
							</Tab>
							<Tab
								className={({ selected }) =>
									`pb-2 text-sm font-medium border-b-2 focus:outline-none ${
										selected
											? "border-orange-500 text-orange-600"
											: "border-transparent text-gray-500 hover:text-gray-700"
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
		</Shell>
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
		<Form method="post" className="space-y-6">
			<input type="hidden" name="category" value={category} />

			{error && (
				<div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
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
					className="block text-sm font-medium text-gray-700 mb-1"
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
					className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
