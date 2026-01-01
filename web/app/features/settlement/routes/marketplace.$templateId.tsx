import { db } from "@itcom/db/client";
import { settlementTemplates, users } from "@itcom/db/schema";
import { eq } from "drizzle-orm";
import {
	CheckCircle2,
	Globe,
	Pencil,
	Share2,
	Star,
	Trash2,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	data,
	redirect,
	useFetcher,
	useLoaderData,
} from "react-router";
import { requireUserId } from "../../auth/utils/session.server";
import {
	SettlementTemplateStatusSchema,
	TEMPLATE_STATUS_CONFIG,
	type SettlementTemplateStatus,
} from "../constants";
import { settlementService } from "../services/settlement.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Avatar } from "~/shared/components/ui/Avatar";
import { Badge } from "~/shared/components/ui/Badge";
import { Button } from "~/shared/components/ui/Button";
import { Label } from "~/shared/components/ui/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import type { Route } from "./+types/marketplace.$templateId";

export function meta({ data }: Route.MetaArgs) {
	return [{ title: `${data?.template?.title} - Marketplace` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
	const templateId = params.templateId;
	if (!templateId) throw new Response("Not Found", { status: 404 });

	const userId = await requireUserId(request);

	const [template, isEquipped, reviews, phases, tasks] = await Promise.all([
		settlementService.getTemplate(templateId),
		settlementService.isEquipped(userId, templateId),
		settlementService.getReviews(templateId),
		settlementService.getPhases(),
		settlementService.getTasksByTemplate(templateId),
	]);

	if (!template) throw new Response("Not Found", { status: 404 });

	const author = template.authorId
		? await db.query.users.findFirst({
				where: eq(users.id, template.authorId),
				columns: {
					displayName: true,
					name: true,
					avatarUrl: true,
					email: true,
				},
			})
		: null;

	const isOwner = template.authorId === userId;
	const myReview = reviews.find((r) => r.userId === userId) || null;

	return data({
		template,
		isEquipped,
		reviews,
		phases,
		tasks,
		author,
		isOwner,
		myReview,
	});
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const templateId = params.templateId;
	if (!templateId) throw new Response("Not Found", { status: 404 });

	const formData = await request.formData();
	const intent = String(formData.get("intent"));

	if (intent === "subscribe") {
		await settlementService.subscribe(userId, templateId);
		return data({ success: true, message: "Equipped successfully!" });
	}

	if (intent === "review") {
		const rating = Number(formData.get("rating"));
		const comment = String(formData.get("comment"));
		await settlementService.addReview(userId, templateId, rating, comment);
		return data({ success: true, message: "Review updated!" });
	}

	if (intent === "delete-review") {
		await settlementService.deleteReview(userId, templateId);
		return data({ success: true, message: "Review deleted!" });
	}

	// Owner Actions
	const template = await settlementService.getTemplate(templateId);
	if (!template || template.authorId !== userId) {
		throw new Response("Access Denied", { status: 403 });
	}

	if (intent === "delete") {
		await db
			.delete(settlementTemplates)
			.where(eq(settlementTemplates.id, templateId));
		return redirect("/settlement/marketplace/my");
	}

	if (intent === "update-status") {
		const status = String(formData.get("status"));
		const parsed = SettlementTemplateStatusSchema.safeParse(status);
		if (!parsed.success) {
			return data({ error: "Invalid status" }, { status: 400 });
		}
		await db
			.update(settlementTemplates)
			.set({ status: parsed.data, updatedAt: new Date() })
			.where(eq(settlementTemplates.id, templateId));
		return data({ success: true, message: "Status updated" });
	}

	return data({ error: "Unknown intent" }, { status: 400 });
}

export default function TemplateDetail() {
	const {
		template,
		isEquipped,
		reviews,
		phases,
		tasks,
		author,
		isOwner,
		myReview,
	} = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const isEquippedOptimistic =
		fetcher.formData?.get("intent") === "subscribe" || isEquipped;

	// Rating State
	const [isEditingReview, setIsEditingReview] = useState(false);
	const [selectedRating, setSelectedRating] = useState(myReview?.rating ?? 5);
	const [hoverRating, setHoverRating] = useState<number | null>(null);

	const activeRating = hoverRating !== null ? hoverRating : selectedRating;
	const showReviewForm =
		isEquippedOptimistic && !isOwner && (!myReview || isEditingReview);

	const handleEditCancel = () => {
		setIsEditingReview(false);
		setSelectedRating(myReview?.rating ?? 5);
	};

	return (
		<div className="stack-lg pt-10 pb-20">
			<PageHeader
				title={template.title}
				description={template.description ?? undefined}
				actions={
					<div className="flex gap-2">
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="subscribe" />
							<Button
								type="submit"
								disabled={isEquippedOptimistic}
								className={`font-semibold transition-all ${
									isEquippedOptimistic ? "opacity-50" : ""
								}`}
							>
								{isEquippedOptimistic ? (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										추가됨
									</>
								) : (
									"내 로드맵에 추가하기"
								)}
							</Button>
						</fetcher.Form>
					</div>
				}
			/>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Left Column: Tasks & Reviews */}
				<div className="stack-md lg:col-span-2">
					{/* Task List Card */}
					<div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
						<div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
							<h2 className="heading-5">포함된 태스크</h2>
							<Badge variant="secondary">{tasks.length}개</Badge>
						</div>
						<div className="p-6">
							<div className="divide-y divide-gray-50">
								{phases.length > 0 ? (
									phases.map((phase) => {
										const phaseTasks = tasks.filter((t) => {
											if (t.phaseId) return t.phaseId === phase.id;
											const days = t.dayOffset ?? 0;
											return days >= phase.minDays && days <= phase.maxDays;
										});
										if (phaseTasks.length === 0) return null;

										return (
											<div key={phase.id} className="py-4 first:pt-0 last:pb-0">
												<h3 className="mb-3 font-semibold text-primary-600 text-sm uppercase tracking-wide">
													{phase.titleKo || phase.title}
												</h3>
												<div className="space-y-3">
													{phaseTasks.map((task) => (
														<div
															key={task.id}
															className="group flex items-start justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
														>
															<div className="stack-xs flex-1">
																<div className="flex items-center gap-2">
																	<span className="font-medium text-gray-900 text-sm">
																		{task.title}
																	</span>
																</div>
																{task.description && (
																	<p className="line-clamp-1 text-gray-500 text-xs">
																		{task.description}
																	</p>
																)}
															</div>
															<Badge
																variant="secondary"
																className="shrink-0 font-mono text-xs"
															>
																D
																{task.dayOffset !== null && task.dayOffset >= 0
																	? "+"
																	: ""}
																{task.dayOffset}
															</Badge>
														</div>
													))}
												</div>
											</div>
										);
									})
								) : (
									<div className="py-8 text-center text-gray-400 text-sm">
										태스크가 없습니다.
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Reviews Card */}
					<div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
						<div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
							<h2 className="heading-5">Reviews</h2>
							<div className="flex gap-1 text-yellow-400">
								{[1, 2, 3, 4, 5].map((s) => (
									<Star
										key={s}
										className={`h-4 w-4 ${
											s <= 4 ? "fill-current" : "text-gray-200"
										}`}
									/>
								))}
							</div>
						</div>
						<div className="p-6">
							{/* Form Section */}
							{showReviewForm ? (
								<fetcher.Form
									method="post"
									className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4"
									onSubmit={() => setIsEditingReview(false)}
								>
									<input type="hidden" name="intent" value="review" />
									<div className="mb-3 flex items-center justify-between">
										<h3 className="font-semibold text-sm">
											{myReview ? "리뷰 수정하기" : "리뷰 작성하기"}
										</h3>
										<div
											className="flex gap-1"
											onMouseLeave={() => setHoverRating(null)}
											role="radiogroup"
											aria-label="Rating selection"
										>
											{[1, 2, 3, 4, 5].map((star) => (
												<label
													key={star}
													className="cursor-pointer"
													onMouseEnter={() => setHoverRating(star)}
												>
													<input
														type="radio"
														name="rating"
														value={star}
														checked={selectedRating === star}
														onChange={() => setSelectedRating(star)}
														className="hidden"
														required
													/>
													<Star
														className={`h-5 w-5 transition-transform hover:scale-110 ${
															star <= activeRating
																? "fill-yellow-400 text-yellow-400"
																: "fill-transparent text-gray-300"
														}`}
													/>
												</label>
											))}
										</div>
									</div>
									<textarea
										name="comment"
										rows={3}
										defaultValue={myReview?.comment || ""}
										className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus-ring"
										placeholder="이 템플릿이 어떠셨나요?"
										required
									/>
									<div className="mt-3 flex justify-end gap-2">
										{isEditingReview && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={handleEditCancel}
											>
												취소
											</Button>
										)}
										<Button type="submit" size="sm">
											{myReview ? "수정 완료" : "등록하기"}
										</Button>
									</div>
								</fetcher.Form>
							) : null}

							{/* My Review Display (if exists and not editing) */}
							{myReview && !isEditingReview && (
								<div className="mb-8 rounded-xl border border-primary-100 bg-primary-50 p-4">
									<div className="mb-2 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge variant="primary">내 리뷰</Badge>
											<div className="flex gap-1 text-yellow-500 text-xs">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														key={`star-${i}`}
														className={`h-3.5 w-3.5 ${
															i < myReview.rating
																? "fill-current"
																: "text-gray-300"
														}`}
													/>
												))}
											</div>
										</div>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-gray-400 hover:text-primary-600"
												onClick={() => {
													setIsEditingReview(true);
													setSelectedRating(myReview.rating);
												}}
											>
												<Pencil className="h-3.5 w-3.5" />
											</Button>
											<fetcher.Form method="post">
												<input
													type="hidden"
													name="intent"
													value="delete-review"
												/>
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-gray-400 hover:text-red-600"
													onClick={(e) => {
														if (!confirm("리뷰를 삭제하시겠습니까?")) {
															e.preventDefault();
														}
													}}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</fetcher.Form>
										</div>
									</div>
									<p className="text-gray-800 text-sm font-medium">
										{myReview.comment}
									</p>
									<p className="mt-2 text-primary-400 text-xs">
										{new Date(myReview.createdAt).toLocaleDateString()} 작성됨
									</p>
								</div>
							)}

							<div className="divide-y divide-gray-50">
								{reviews.length === 0 ? (
									<div className="py-8 text-center text-gray-400 text-sm">
										아직 리뷰가 없습니다.
									</div>
								) : (
									reviews.map((review) => {
										// Skip rendering my review in the general list to avoid duplication if desired,
										// OR keep it. Usually showing it at top as "My Review" and hiding from general list is better.
										if (review.userId === myReview?.userId) return null;

										return (
											<div
												key={review.id}
												className="py-4 first:pt-0 last:pb-0"
											>
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Avatar
															src={review.author?.avatarUrl || undefined}
															alt={
																review.author?.displayName ||
																review.author?.name ||
																"Reviewer"
															}
															fallback={review.author?.displayName?.[0] || "?"}
															className="h-8 w-8"
														/>
														<span className="font-medium text-sm">
															{review.author?.displayName || "익명"}
														</span>
													</div>
													<span className="text-gray-400 text-xs">
														{new Date(review.createdAt).toLocaleDateString()}
													</span>
												</div>
												<div className="mb-2 flex gap-1 text-yellow-400 text-xs">
													{Array.from({ length: 5 }).map((_, i) => (
														<Star
															key={`review-star-${i}`}
															className={`h-3 w-3 ${
																i < review.rating
																	? "fill-current"
																	: "text-gray-200"
															}`}
														/>
													))}
												</div>
												<p className="text-gray-600 text-sm">
													{review.comment}
												</p>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Sidebar */}
				<div className="stack-md sticky top-24 self-start">
					{/* Owner Controls */}
					{isOwner && (
						<div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
							<div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
								<h3 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
									<UserIcon className="h-4 w-4 text-gray-500" />
									제작자 관리
								</h3>
							</div>
							<div className="stack-sm p-6">
								<fetcher.Form method="post">
									<input type="hidden" name="intent" value="update-status" />
									<Label className="mb-1.5 block text-gray-500 text-xs">
										공개 상태 설정
									</Label>
									<Select
										name="status"
										defaultValue={template.status ?? "draft"}
										onValueChange={(val) => {
											fetcher.submit(
												{ intent: "update-status", status: val },
												{ method: "post" },
											);
										}}
									>
										<SelectTrigger>
											<SelectValue>
												{(() => {
													const status =
														(template.status as SettlementTemplateStatus) ||
														"draft";
													const config =
														TEMPLATE_STATUS_CONFIG[status] ||
														TEMPLATE_STATUS_CONFIG.draft;
													return (
														<span className="flex items-center gap-2">
															<span
																className={`h-2 w-2 rounded-full ${config.dotColor}`}
															/>
															{config.label}
														</span>
													);
												})()}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TEMPLATE_STATUS_CONFIG).map(
												([key, conf]) => (
													<SelectItem key={key} value={key}>
														<span className="flex items-center gap-2">
															<span
																className={`h-2 w-2 rounded-full ${conf.dotColor}`}
															/>
															{conf.label}
														</span>
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</fetcher.Form>

								<hr className="my-2 border-gray-100" />

								<Button
									variant="outline"
									asChild
									className="w-full justify-start"
								>
									<a href={`/settlement/editor/${template.id}`}>
										<Pencil className="mr-2 h-4 w-4" />
										템플릿 수정
									</a>
								</Button>

								<fetcher.Form
									method="post"
									onSubmit={(e) => {
										if (
											!confirm("정말로 삭제하시겠습니까? 복구할 수 없습니다.")
										) {
											e.preventDefault();
										}
									}}
								>
									<input type="hidden" name="intent" value="delete" />
									<Button
										type="submit"
										variant="ghost"
										className="h-9 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										템플릿 삭제
									</Button>
								</fetcher.Form>
							</div>
						</div>
					)}

					{/* Author Card */}
					<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
						<h3 className="mb-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">
							Created By
						</h3>
						<div className="flex items-center gap-3">
							<Avatar
								src={author?.avatarUrl || undefined}
								alt={author?.displayName || author?.name || "Author"}
								fallback={author?.displayName?.[0] || author?.name?.[0] || "U"}
								className="h-12 w-12"
							/>
							<div>
								<div className="font-semibold text-gray-900">
									{author?.displayName || author?.name || "Unknown"}
								</div>
								<div className="text-gray-500 text-xs">Official Creator</div>
							</div>
						</div>
					</div>

					{/* Info Card */}
					<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
						<h3 className="mb-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">
							Information
						</h3>
						<dl className="space-y-3 text-sm">
							<div className="flex items-center justify-between py-1">
								<dt className="text-gray-500">Version</dt>
								<dd className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
									v{template.version}
								</dd>
							</div>
							<div className="flex items-center justify-between py-1">
								<dt className="text-gray-500">Last Updated</dt>
								<dd>{new Date(template.updatedAt).toLocaleDateString()}</dd>
							</div>
							{template.region && (
								<div className="flex items-center justify-between border-gray-50 border-t pt-3 py-1">
									<dt className="flex items-center gap-1.5 text-gray-500">
										<Globe className="h-3.5 w-3.5" /> Region
									</dt>
									<dd className="font-medium text-gray-900">
										{template.region}
									</dd>
								</div>
							)}
							{template.targetVisa && (
								<div className="flex items-center justify-between py-1">
									<dt className="flex items-center gap-1.5 text-gray-500">
										<UserIcon className="h-3.5 w-3.5" /> Visa
									</dt>
									<dd className="font-medium text-gray-900">
										{template.targetVisa}
									</dd>
								</div>
							)}
							{template.familyStatus && (
								<div className="flex items-center justify-between py-1">
									<dt className="flex items-center gap-1.5 text-gray-500">
										<UserIcon className="h-3.5 w-3.5" /> Family
									</dt>
									<dd className="font-medium text-gray-900">
										{template.familyStatus}
									</dd>
								</div>
							)}
						</dl>
					</div>

					<div className="text-center">
						<Button variant="ghost" size="sm" className="text-gray-400">
							<Share2 className="mr-2 h-3.5 w-3.5" />
							공유하기
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
