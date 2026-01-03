// DnD & Motion Removed
import { db } from "@itcom/db/client";
import {
	type SettlementTaskTemplate,
	settlementTaskTemplates,
	settlementTemplates,
} from "@itcom/db/schema";
import { eq, inArray } from "drizzle-orm";
import { AnimatePresence } from "framer-motion";
import { Pencil, Plus, Save, Settings } from "lucide-react"; // Removed GripVertical
import { useEffect, useMemo, useState } from "react";
import {
	type ActionFunctionArgs,
	data,
	type LoaderFunctionArgs,
	redirect,
	useFetcher,
	useLoaderData,
} from "react-router";
import { toast } from "sonner";
import { PageHeader } from "~/shared/components/layout/PageHeader";
import { Button } from "~/shared/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import { Input } from "~/shared/components/ui/Input";
import { Label } from "~/shared/components/ui/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { Textarea } from "~/shared/components/ui/Textarea";
import { requireUserId } from "../../auth/utils/session.server";
import { TaskDialog } from "../components/TaskDialog";
import { settlementService } from "../services/settlement.server";
import { useEditorStore } from "../stores/editorStore";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const templateId = params.templateId;
	if (!templateId) throw new Response("Not Found", { status: 404 });

	const template = await settlementService.getTemplate(templateId);
	if (!template) throw new Response("Not Found", { status: 404 });
	if (template.authorId !== userId)
		throw new Response("Access Denied", { status: 403 });

	// Fetch Tasks - Already sorted by dayOffset if service does it, but we'll sort in UI anyway
	const tasks = await settlementService.getTasksByTemplate(templateId);
	const phases = await settlementService.getPhases();
	const categories = await settlementService.getCategories();

	return data({ template, tasks, phases, categories });
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const templateId = params.templateId;
	if (!templateId) throw new Response("Not Found", { status: 404 });

	const formData = await request.formData();
	const intent = String(formData.get("intent"));

	// Verify ownership
	const template = await settlementService.getTemplate(templateId);
	if (!template || template.authorId !== userId)
		throw new Response("Access Denied", { status: 403 });

	if (intent === "save-all") {
		const tasksJson = String(formData.get("tasks"));
		const templateJson = String(formData.get("template"));

		const tasks = JSON.parse(tasksJson) as SettlementTaskTemplate[];
		const templateData = JSON.parse(templateJson); // Title, description, filters

		// 1. Update Template Metadata
		await db
			.update(settlementTemplates)
			.set({
				title: templateData.title,
				description: templateData.description,
				targetVisa: templateData.targetVisa,
				familyStatus: templateData.familyStatus,
				region: templateData.region,
				updatedAt: new Date(),
			})
			.where(eq(settlementTemplates.id, templateId));

		// 2. Sync Tasks
		const existingTasks = await db.query.settlementTaskTemplates.findMany({
			where: eq(settlementTaskTemplates.templateId, templateId),
			columns: { id: true },
		});
		const existingIds = new Set(existingTasks.map((t) => t.id));

		const incomingIds = new Set(
			tasks.map((t) => t.id).filter((id: string) => !id.startsWith("new-")),
		);

		// Delete missing
		const toDeleteIds = [...existingIds].filter((id) => !incomingIds.has(id));
		if (toDeleteIds.length > 0) {
			await db
				.delete(settlementTaskTemplates)
				.where(inArray(settlementTaskTemplates.id, toDeleteIds));
		}

		// Upsert
		for (const task of tasks) {
			const taskData = {
				title: task.title,
				category: task.category,
				phaseId: task.phaseId,
				dayOffset: task.dayOffset,
				orderIndex: task.orderIndex, // We might still keep orderIndex, but dayOffset is primary for display
				updatedAt: new Date(),
			};

			if (task.id.startsWith("new-")) {
				// Insert
				await db.insert(settlementTaskTemplates).values({
					...taskData,
					id: undefined, // Let DB generate UUID
					templateId: templateId,
				});
			} else {
				// Update
				if (existingIds.has(task.id)) {
					await db
						.update(settlementTaskTemplates)
						.set(taskData)
						.where(eq(settlementTaskTemplates.id, task.id));
				}
			}
		}

		return data({ success: true });
	}

	if (intent === "publish") {
		await db
			.update(settlementTemplates)
			.set({ status: "published", updatedAt: new Date() })
			.where(eq(settlementTemplates.id, templateId));
		return redirect(`/settlement/marketplace/${templateId}`);
	}

	return null;
}

export default function TemplateEditor() {
	const { template, tasks, phases, categories } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();

	// Store
	const store = useEditorStore();

	// Initialize Store
	useEffect(() => {
		store.setInitialData(template, tasks, phases);
	}, [template, tasks, phases, store.setInitialData]); // Only on load/re-load

	// Dialog States
	const [isMetaOpen, setIsMetaOpen] = useState(false);
	const [isTaskOpen, setIsTaskOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<SettlementTaskTemplate | null>(
		null,
	);
	const [_selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
	const [addSessionId, setAddSessionId] = useState(0);
	// const [activeId, setActiveId] = useState<string | null>(null); // DnD removed

	const handleDialogSubmit = (data: {
		title: string;
		phaseId: string;
		category: string;
		dayOffset: number;
	}) => {
		if (editingTask) {
			store.updateTask(editingTask.id, data);
		} else {
			store.addTask(data.phaseId, data.title, data.category, data.dayOffset);
		}
		setIsTaskOpen(false);
	};

	const handleDialogDelete = () => {
		if (editingTask) {
			store.deleteTask(editingTask.id);
			setIsTaskOpen(false);
		}
	};

	// Handlers
	const handleAddTask = (phaseId?: string) => {
		setAddSessionId((prev) => prev + 1);
		setEditingTask(null);
		setSelectedPhaseId(phaseId || phases[0]?.id);
		setIsTaskOpen(true);
	};

	const handleEditTask = (task: SettlementTaskTemplate) => {
		setEditingTask(task);
		setSelectedPhaseId(task.phaseId || null);
		setIsTaskOpen(true);
	};

	const handleSaveAll = () => {
		store.setSaving(true);
		toast.loading("저장 중...");
		fetcher.submit(
			{
				intent: "save-all",
				tasks: JSON.stringify(store.tasks),
				template: JSON.stringify(store.template),
			},
			{ method: "post" },
		);
	};

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			if ("success" in fetcher.data && fetcher.data.success) {
				store.setSaving(false);
				toast.dismiss();
				toast.success("저장되었습니다.");
			}
		}
	}, [fetcher.state, fetcher.data, store.setSaving]);

	// Group tasks by phase (Memoized from store) AND AUTO-SORT by dayOffset
	const tasksByPhase = useMemo(() => {
		return phases.reduce(
			(acc, phase) => {
				const phaseTasks = store.tasks.filter((t) => t.phaseId === phase.id);
				// AUTO-SORT: dayOffset Ascending
				phaseTasks.sort((a, b) => {
					// Handle nulls if any (shouldn't be based on valid schema use)
					const da = a.dayOffset ?? 0;
					const db = b.dayOffset ?? 0;
					if (da !== db) return da - db;
					// Secondary sort: maybe created time or orderIndex just in case
					return a.orderIndex - b.orderIndex;
				});

				acc[phase.id] = phaseTasks;
				return acc;
			},
			{} as Record<string, SettlementTaskTemplate[]>,
		);
	}, [store.tasks, phases]);

	return (
		<div className="stack-md pb-20">
			<PageHeader
				title="체크리스트 에디터"
				description="나만의 이주 체크리스트를 만들어보세요."
				actions={
					<div className="flex gap-2">
						<Button
							variant="secondary"
							onClick={handleSaveAll}
							disabled={!store.isDirty || fetcher.state !== "idle"}
						>
							<Save className="mr-1 h-4 w-4" />
							{fetcher.state !== "idle" ? "저장 중..." : "저장"}
						</Button>
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="publish" />
							<Button type="submit" disabled={store.isDirty}>
								게시하기
							</Button>
						</fetcher.Form>
					</div>
				}
			/>
			{store.isDirty && (
				<div className="font-medium text-amber-600 text-sm">
					⚠️ 저장되지 않은 변경사항이 있습니다.
				</div>
			)}

			{/* Template Info Card */}
			<div className="flex items-start justify-between rounded-2xl border border-gray-100 bg-white p-responsive shadow-sm">
				<div>
					<h2 className="heading-4 mb-2">{store.template?.title}</h2>
					<p className="text-gray-600">
						{store.template?.description || "설명이 없습니다."}
					</p>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setIsMetaOpen(true)}>
					<Pencil className="h-4 w-4" />
				</Button>
			</div>

			{/* Phases Container - No DnD Context needed */}
			<div className="space-y-8">
				{phases.map((phase) => (
					<div
						key={phase.id}
						className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
					>
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h3 className="font-bold text-gray-900 text-lg">
									{phase.titleKo}
								</h3>
								<p className="text-gray-500 text-xs">
									{phase.minDays}~{phase.maxDays} days
								</p>
							</div>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleAddTask(phase.id)}
							>
								<Plus className="mr-1 h-4 w-4" /> 할 일 추가
							</Button>
						</div>

						{/* Task List (Auto Sorted) */}
						<div className="min-h-[50px] space-y-2">
							{tasksByPhase[phase.id]?.length === 0 && (
								<div className="rounded-lg border border-dashed py-4 text-center text-gray-400 text-sm">
									할 일이 없습니다. 추가해주세요!
								</div>
							)}
							<AnimatePresence>
								{tasksByPhase[phase.id]?.map((task) => (
									// Directly render TaskCard, no Sortable wrapper
									<TaskCard
										key={task.id}
										task={task}
										onEdit={() => handleEditTask(task)}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				))}
			</div>

			{/* Meta Dialog */}
			<Dialog open={isMetaOpen} onOpenChange={setIsMetaOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>체크리스트 정보 수정</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.currentTarget);
							store.updateTemplate({
								title: String(formData.get("title")),
								description: String(formData.get("description")),
								targetVisa: String(formData.get("targetVisa") || ""),
								familyStatus: String(formData.get("familyStatus") || ""),
								region: String(formData.get("region") || ""),
							});
							setIsMetaOpen(false);
						}}
						className="stack-sm mt-4"
					>
						<div className="stack-xs">
							<Label>제목</Label>
							<Input
								name="title"
								defaultValue={store.template?.title || ""}
								required
							/>
						</div>
						<div className="stack-xs">
							<Label>설명</Label>
							<Textarea
								name="description"
								defaultValue={store.template?.description || ""}
							/>
						</div>

						{/* New Fields */}
						<div className="grid grid-cols-2 gap-4">
							<div className="stack-xs">
								<Label>대상 비자</Label>
								<Select
									name="targetVisa"
									defaultValue={store.template?.targetVisa || ""}
								>
									<SelectTrigger>
										<SelectValue placeholder="선택 (옵션)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Engineer">
											기술/인문지식/국제업무
										</SelectItem>
										<SelectItem value="Student">유학</SelectItem>
										<SelectItem value="Working Holiday">
											워킹홀리데이
										</SelectItem>
										<SelectItem value="Dependent">가족체재</SelectItem>
										<SelectItem value="HSP">고도인재</SelectItem>
										<SelectItem value="Spouse">일본인의 배우자</SelectItem>
										<SelectItem value="Other">기타</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="stack-xs">
								<Label>가족 형태</Label>
								<Select
									name="familyStatus"
									defaultValue={store.template?.familyStatus || ""}
								>
									<SelectTrigger>
										<SelectValue placeholder="선택 (옵션)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Single">1인 (싱글)</SelectItem>
										<SelectItem value="Couple">2인 (부부/커플)</SelectItem>
										<SelectItem value="Family with Kids">자녀 동반</SelectItem>
										<SelectItem value="Pet Owner">반려동물 동반</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="stack-xs">
								<Label>지역</Label>
								<Select
									name="region"
									defaultValue={store.template?.region || "Tokyo"}
								>
									<SelectTrigger>
										<SelectValue placeholder="선택" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Tokyo">도쿄 (Tokyo)</SelectItem>
										<SelectItem value="Osaka">오사카 (Osaka)</SelectItem>
										<SelectItem value="Fukuoka">후쿠오카 (Fukuoka)</SelectItem>
										<SelectItem value="Nagoya">나고야 (Nagoya)</SelectItem>
										<SelectItem value="Remote">기타/원격</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsMetaOpen(false)}
							>
								취소
							</Button>
							<Button type="submit">적용 (저장 필요)</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Task Dialog */}
			<TaskDialog
				key={editingTask ? editingTask.id : `new-${addSessionId}`}
				open={isTaskOpen}
				onOpenChange={setIsTaskOpen}
				initialData={editingTask}
				phases={phases}
				categories={categories}
				defaultPhaseId={_selectedPhaseId || undefined}
				onSubmit={handleDialogSubmit}
				onDelete={handleDialogDelete}
			/>
		</div>
	);
}

// SortableTaskItem removed

function TaskCard({
	task,
	onEdit,
}: {
	task: SettlementTaskTemplate;
	onEdit: () => void;
}) {
	return (
		<div className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
			<div className="flex items-center gap-3 overflow-hidden">
				{/* DnD Handle Removed */}
				<div className="min-w-0">
					<h4 className="truncate font-medium">{task.title}</h4>
					<div className="flex items-center gap-2 text-gray-500 text-xs">
						<span className="rounded bg-gray-100 px-1.5 py-0.5 capitalize">
							{task.category}
						</span>
						<span
							className={`font-semibold ${task.dayOffset !== null && task.dayOffset < 0 ? "text-amber-600" : "text-blue-600"}`}
						>
							{task.dayOffset !== null
								? `${task.dayOffset > 0 ? "+" : ""}${task.dayOffset}일`
								: "미지정"}
						</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
				<Button
					size="sm"
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
				>
					<Settings className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
