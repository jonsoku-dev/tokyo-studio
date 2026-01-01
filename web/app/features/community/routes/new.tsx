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
	return [{ title: "새 글 작성 - Japan IT Job" }];
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
				<h1 className="heading-3">새 글 작성</h1>
				<p className="text-gray-500 text-sm">
					경험을 공유하거나 질문을 남겨보세요.
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
							질문하기
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
							후기 작성
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
				label="제목"
				placeholder={
					category === "review"
						? "예: 라인 야후 프론트엔드 면접 후기"
						: "예: 비자 인터뷰 어떻게 준비하나요?"
				}
				required
			/>

			<div>
				<label
					htmlFor="content"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					내용
				</label>
				<MarkdownEditor
					value={content}
					onChange={setContent}
					label="내용"
					placeholder={
						category === "review"
							? "면접 과정, 질문 내용, 결과, 느낌 점 등을 자유롭게 공유해주세요..."
							: "궁금한 점을 자세히 적어주세요..."
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
					취소
				</Link>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "등록 중..." : "등록"}
				</Button>
			</div>
		</Form>
	);
}
