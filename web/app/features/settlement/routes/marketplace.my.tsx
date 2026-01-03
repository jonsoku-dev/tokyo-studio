import {
	Calendar,
	Eye,
	FileText,
	MapPin,
	Pencil,
	Plus,
	Trash2,
	User,
} from "lucide-react";
import { data, Link, useFetcher, useLoaderData } from "react-router";
import { requireUserId } from "~/features/auth/utils/session.server";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Badge } from "~/shared/components/ui/Badge";
import { Button } from "~/shared/components/ui/Button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import {
	type SettlementTemplateStatus,
	SettlementTemplateStatusSchema,
	TEMPLATE_STATUS_CONFIG,
} from "../constants";
import { settlementService } from "../services/settlement.server";
import type { Route } from "./+types/marketplace.my";

export function meta() {
	return [{ title: "My Templates - Japan IT Job" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request);
	const templates = await settlementService.getMyTemplates(userId);
	return data({ templates });
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent"));
	const templateId = String(formData.get("templateId"));

	if (intent === "update-status") {
		const status = String(formData.get("status"));
		const parsed = SettlementTemplateStatusSchema.safeParse(status);
		if (parsed.success) {
			await settlementService.updateTemplateStatus(
				templateId,
				userId,
				parsed.data,
			);
		}
	} else if (intent === "delete") {
		await settlementService.deleteTemplate(templateId, userId);
	}

	return data({ success: true });
}

export default function MyTemplatesPage() {
	const { templates } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	return (
		<div className="stack-md">
			<PageHeader
				title="내 체크리스트 관리"
				description="내가 만든 체크리스트의 상태를 변경하거나 수정할 수 있습니다."
				actions={
					<Button asChild className="gap-2">
						<Link to="/settlement/editor/new">
							<Plus className="h-4 w-4" />
							새로 만들기
						</Link>
					</Button>
				}
			/>

			{templates.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 border-dashed bg-gray-50 py-20 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
						<FileText className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="font-bold text-gray-900 text-lg">
						아직 만든 체크리스트가 없습니다
					</h3>
					<p className="mb-6 text-gray-500">
						나만의 정착 노하우를 공유해보세요!
					</p>
					<Button variant="outline" asChild>
						<Link to="/settlement/editor/new">첫 체크리스트 만들기 &rarr;</Link>
					</Button>
				</div>
			) : (
				<div className="grid gap-responsive">
					{templates.map((template) => {
						const status =
							(template.status as SettlementTemplateStatus) || "draft";
						const config =
							TEMPLATE_STATUS_CONFIG[status] || TEMPLATE_STATUS_CONFIG.draft;

						return (
							<div
								key={template.id}
								className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-responsive shadow-sm transition-all hover:border-primary-100 hover:shadow-md md:flex-row md:items-start md:justify-between md:gap-6"
							>
								{/* Main Content */}
								<div className="stack-sm flex-1">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<h3 className="heading-5 text-gray-900">
												<Link
													to={`/settlement/marketplace/${template.id}`}
													className="decoration-primary-200 underline-offset-4 transition-colors hover:text-primary-600 hover:underline"
												>
													{template.title}
												</Link>
											</h3>
											{template.isOfficial && (
												<Badge variant="primary">OFFICIAL</Badge>
											)}
										</div>
									</div>

									<p className="line-clamp-2 max-w-2xl text-gray-500 text-sm">
										{template.description || "설명이 없습니다."}
									</p>

									<div className="flex flex-wrap gap-2">
										{template.targetVisa && (
											<Badge variant="secondary" className="font-normal">
												<User className="mr-1 h-3 w-3" />
												{template.targetVisa}
											</Badge>
										)}
										{template.familyStatus && (
											<Badge variant="secondary" className="font-normal">
												<User className="mr-1 h-3 w-3" />
												{template.familyStatus}
											</Badge>
										)}
										{template.region && (
											<Badge
												variant="outline"
												className="bg-gray-50 font-normal"
											>
												<MapPin className="mr-1 h-3 w-3" />
												{template.region}
											</Badge>
										)}
									</div>

									<div className="mt-2 flex items-center gap-4 font-mono text-gray-400 text-xs">
										<span className="flex items-center gap-1">
											v{template.version}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											Updated{" "}
											{new Date(template.updatedAt).toLocaleDateString()}
										</span>
									</div>
								</div>

								{/* Actions Column */}
								<div className="flex flex-row items-center gap-3 border-gray-100 border-t pt-4 md:flex-col md:items-end md:border-0 md:pt-0">
									{/* Status Select */}
									<div className="w-full md:w-36">
										<fetcher.Form method="post">
											<input
												type="hidden"
												name="intent"
												value="update-status"
											/>
											<input
												type="hidden"
												name="templateId"
												value={template.id}
											/>
											<Select
												name="status"
												defaultValue={status}
												onValueChange={(val) => {
													const formData = new FormData();
													formData.append("intent", "update-status");
													formData.append("templateId", template.id);
													formData.append("status", val);
													fetcher.submit(formData, { method: "post" });
												}}
											>
												<SelectTrigger className="h-9 border-gray-200 bg-gray-50 text-xs">
													<SelectValue>
														<span className="flex items-center gap-2">
															<span
																className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`}
															/>
															{config.label.split("(")[0]}
														</span>
													</SelectValue>
												</SelectTrigger>
												<SelectContent anchor="bottom end">
													{Object.entries(TEMPLATE_STATUS_CONFIG).map(
														([key, conf]) => (
															<SelectItem key={key} value={key}>
																<span className="flex items-center gap-2">
																	<span
																		className={`h-1.5 w-1.5 rounded-full ${conf.dotColor}`}
																	/>
																	{conf.label}
																</span>
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										</fetcher.Form>
									</div>

									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-9 w-9 text-gray-500"
											asChild
											title="미리보기"
										>
											<Link to={`/settlement/marketplace/${template.id}`}>
												<Eye className="h-4 w-4" />
											</Link>
										</Button>

										<Button
											variant="outline"
											size="icon"
											className="h-9 w-9 border-gray-200 bg-white text-primary-600"
											asChild
											title="수정"
										>
											<Link to={`/settlement/editor/${template.id}`}>
												<Pencil className="h-4 w-4" />
											</Link>
										</Button>

										<fetcher.Form
											method="post"
											onSubmit={(e) => {
												if (!confirm("정말 삭제하시겠습니까?")) {
													e.preventDefault();
												}
											}}
										>
											<input
												type="hidden"
												name="templateId"
												value={template.id}
											/>
											<input type="hidden" name="intent" value="delete" />
											<Button
												type="submit"
												variant="ghost"
												size="icon"
												className="h-9 w-9 text-gray-400 hover:bg-red-50 hover:text-red-600"
												title="삭제"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</fetcher.Form>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
