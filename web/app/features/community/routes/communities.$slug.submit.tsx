import { db } from "@itcom/db/client";
import { communityPosts } from "@itcom/db/schema";
import { Info } from "lucide-react";
import { useState } from "react";
import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { requireUserId } from "../../auth/utils/session.server";
import { getCommunity, hasJoined } from "../services/communities.server";
import type { Route } from "./+types/communities.$slug.submit";

export async function loader({ request, params }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const { slug } = params;

	const community = await getCommunity(slug);
	if (!community) {
		throw new Response("Community not found", { status: 404 });
	}

	// Check if user is a member
	const isMember = await hasJoined(userId, community.id);
	if (!isMember) {
		throw redirect(`/communities/${slug}`);
	}

	return { community };
}

export async function action({ request, params }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const { slug } = params;

	const community = await getCommunity(slug);
	if (!community) {
		throw new Response("Community not found", { status: 404 });
	}

	const formData = await request.formData();
	const title = formData.get("title") as string;
	const content = formData.get("content") as string;

	if (!title || !content) {
		return { error: "제목과 내용을 입력해주세요." };
	}

	// Create post directly
	const [post] = await db
		.insert(communityPosts)
		.values({
			title,
			content,
			category: slug, // Keep for backward compat
			communityId: community.id,
			authorId: userId,
			postType: "text",
		})
		.returning({ id: communityPosts.id });

	return redirect(`/communities/${slug}/posts/${post.id}`);
}

export default function SubmitPost() {
	const { community } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	const isSubmitting = fetcher.state !== "idle";

	return (
		<div className="mx-auto">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-2xl text-gray-900 tracking-tight">
					게시글 작성
					<span className="ml-2 font-normal text-gray-500 text-sm">
						in @{community.slug}
					</span>
				</h1>
			</div>

			<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-gray-200/50 shadow-xl">
				{/* Progress/Status Indicator (Optional, can be added later) */}

				<fetcher.Form method="post" className="space-y-6 p-responsive">
					{fetcher.data?.error && (
						<div
							className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-responsive font-medium text-red-600 text-sm"
							role="alert"
						>
							<Info className="h-4 w-4" />
							{fetcher.data.error}
						</div>
					)}

					{/* Title Input */}
					<div className="space-y-2">
						<label
							htmlFor="title"
							className="block font-bold text-gray-700 text-sm"
						>
							제목
						</label>
						<div className="relative">
							<input
								id="title"
								name="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="제목을 입력하세요 (300자 이내)"
								className="w-full rounded-xl border-gray-200 px-4 py-3 font-medium text-lg shadow-sm transition-all placeholder:text-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
								maxLength={300}
								required
							/>
							<div className="absolute top-1/2 right-3 -translate-y-1/2 font-medium text-gray-400 text-xs">
								{title.length}/300
							</div>
						</div>
					</div>

					{/* Content Textarea */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label
								htmlFor="content"
								className="block font-bold text-gray-700 text-sm"
							>
								내용
							</label>
							<a
								href="https://www.markdownguide.org/cheat-sheet/"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 font-medium text-gray-400 text-xs transition-colors hover:text-primary-600"
							>
								<Info className="h-3 w-3" />
								마크다운 지원
							</a>
						</div>
						<textarea
							id="content"
							name="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="자유롭게 이야기를 나누어보세요. (마크다운을 지원합니다)"
							className="h-[400px] w-full resize-none rounded-xl border-gray-200 p-responsive text-base leading-relaxed shadow-sm transition-all placeholder:text-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
							required
						/>
					</div>

					{/* Footer Actions */}
					<div className="flex items-center justify-end gap-3 border-gray-50 border-t pt-6">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="rounded-xl px-5 py-2.5 font-bold text-gray-500 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
							disabled={isSubmitting}
						>
							취소
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !title || !content}
							className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 font-bold text-sm text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:bg-primary-700 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
						>
							{isSubmitting ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									게시 중...
								</>
							) : (
								"게시하기"
							)}
						</button>
					</div>
				</fetcher.Form>
			</div>
		</div>
	);
}
