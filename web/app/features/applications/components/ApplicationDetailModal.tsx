import { Calendar, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/shared/components/ui/Dialog";
import type {
	ApplicationStep,
	PipelineItem,
	PipelineStage,
	PipelineStatus,
} from "../domain/pipeline.types";

type TabId = "basic" | "intent" | "strategy" | "process" | "reflection";
type InterestLevelValue = "high" | "medium" | "low";
type ConfidenceLevelValue = "confident" | "neutral" | "uncertain";
type StepTypeValue = "interview" | "assignment" | "offer" | "other";

interface ApplicationDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: PipelineItem;
	stages: PipelineStage[];
	userResumes?: Array<{
		id: string;
		title: string;
		type: string;
		status: string;
	}>;
}

const TABS: { id: TabId; label: string }[] = [
	{ id: "basic", label: "기본 정보" },
	{ id: "intent", label: "지원 컨텍스트" },
	{ id: "strategy", label: "전략 스냅샷" },
	{ id: "process", label: "진행 로그" },
	{ id: "reflection", label: "결과 회고" },
];

const INTEREST_OPTIONS: { value: InterestLevelValue; label: string }[] = [
	{ value: "high", label: "높음" },
	{ value: "medium", label: "보통" },
	{ value: "low", label: "낮음" },
];

const CONFIDENCE_OPTIONS: { value: ConfidenceLevelValue; label: string }[] = [
	{ value: "confident", label: "자신감" },
	{ value: "neutral", label: "보통" },
	{ value: "uncertain", label: "불확실" },
];

const STEP_TYPE_OPTIONS: { value: StepTypeValue; label: string }[] = [
	{ value: "interview", label: "면접" },
	{ value: "assignment", label: "과제" },
	{ value: "offer", label: "오퍼" },
	{ value: "other", label: "기타" },
];

export function ApplicationDetailModal({
	isOpen,
	onClose,
	item,
	stages,
	userResumes = [],
}: ApplicationDetailModalProps) {
	const [formKey, setFormKey] = useState(0);

	const handleClose = () => {
		setFormKey((k) => k + 1);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent
				key={`detail-${formKey}-${item.id}`}
				className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden"
			>
				<DetailFormContent
					item={item}
					stages={stages}
					userResumes={userResumes}
					onClose={handleClose}
				/>
			</DialogContent>
		</Dialog>
	);
}

function DetailFormContent({
	item,
	stages,
	userResumes,
	onClose,
}: {
	item: PipelineItem;
	stages: PipelineStage[];
	userResumes: Array<{
		id: string;
		title: string;
		type: string;
		status: string;
	}>;
	onClose: () => void;
}) {
	const [activeTab, setActiveTab] = useState<TabId>("basic");
	const actionFetcher = useFetcher();
	const stepsFetcher = useFetcher();

	const [company, setCompany] = useState(item.company);
	const [position, setPosition] = useState(item.position);
	const [stage, setStage] = useState<PipelineStatus>(item.stage);
	const [date, setDate] = useState(
		item.date ? new Date(item.date).toISOString().split("T")[0] : "",
	);
	const [nextAction, setNextAction] = useState(item.nextAction || "");
	const [resumeId, setResumeId] = useState<string>(item.resumeId || "");

	const initialInterest = item.interestLevel as InterestLevelValue | null;
	const initialConfidence = item.confidenceLevel as ConfidenceLevelValue | null;

	const [motivation, setMotivation] = useState(item.motivation || "");
	const [interestLevel, setInterestLevel] = useState<InterestLevelValue | "">(
		initialInterest || "",
	);
	const [confidenceLevel, setConfidenceLevel] = useState<
		ConfidenceLevelValue | ""
	>(initialConfidence || "");

	const [resumeVersionNote, setResumeVersionNote] = useState(
		item.resumeVersionNote || "",
	);
	const [positioningStrategy, setPositioningStrategy] = useState(
		item.positioningStrategy || "",
	);
	const [emphasizedStrengths, setEmphasizedStrengths] = useState<string[]>(
		item.emphasizedStrengths || [],
	);
	const [newStrength, setNewStrength] = useState("");

	const [outcomeReason, setOutcomeReason] = useState(item.outcomeReason || "");
	const [lessonsLearned, setLessonsLearned] = useState(
		item.lessonsLearned || "",
	);
	const [nextTimeChange, setNextTimeChange] = useState(
		item.nextTimeChange || "",
	);

	const initialSteps = (item.steps || []) as ApplicationStep[];
	const [steps, setSteps] = useState<ApplicationStep[]>(initialSteps);
	const [editingStepId, setEditingStepId] = useState<string | null>(null);
	const [showAddStep, setShowAddStep] = useState(false);

	const isTerminated = stage === "rejected" || stage === "withdrawn";

	const isSuccess =
		actionFetcher.state === "idle" &&
		actionFetcher.data &&
		typeof actionFetcher.data === "object" &&
		"success" in actionFetcher.data;

	if (isSuccess) {
		setTimeout(onClose, 0);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		actionFetcher.submit(
			{
				intent: "edit",
				itemId: item.id,
				company,
				position,
				stage,
				date,
				nextAction,
				resumeId,
				motivation,
				interestLevel,
				confidenceLevel,
				resumeVersionNote,
				positioningStrategy,
				emphasizedStrengths: JSON.stringify(emphasizedStrengths),
				outcomeReason,
				lessonsLearned,
				nextTimeChange,
			},
			{ method: "POST", action: "/applications" },
		);
	};

	const addStrength = () => {
		const trimmed = newStrength.trim();
		if (trimmed && !emphasizedStrengths.includes(trimmed)) {
			setEmphasizedStrengths([...emphasizedStrengths, trimmed]);
			setNewStrength("");
		}
	};

	const removeStrength = (s: string) => {
		setEmphasizedStrengths(emphasizedStrengths.filter((x) => x !== s));
	};

	const handleStepCreate = (data: {
		stepType: StepTypeValue;
		date: string;
		summary: string;
		selfEvaluation: string;
	}) => {
		stepsFetcher.submit(JSON.stringify({ applicationId: item.id, ...data }), {
			method: "POST",
			action: "/api/applications/steps",
			encType: "application/json",
		});
		setShowAddStep(false);
	};

	const handleStepUpdate = (
		stepId: string,
		data: {
			stepType: StepTypeValue;
			date: string;
			summary: string;
			selfEvaluation: string;
		},
	) => {
		stepsFetcher.submit(JSON.stringify({ stepId, ...data }), {
			method: "PATCH",
			action: "/api/applications/steps",
			encType: "application/json",
		});
		setEditingStepId(null);
	};

	const handleStepDelete = (stepId: string) => {
		stepsFetcher.submit(JSON.stringify({ stepId }), {
			method: "DELETE",
			action: "/api/applications/steps",
			encType: "application/json",
		});
		setSteps(steps.filter((s) => s.id !== stepId));
	};

	return (
		<>
			<DialogHeader className="shrink-0">
				<div className="flex items-center justify-between">
					<DialogTitle className="font-semibold text-lg">
						{item.company} - {item.position}
					</DialogTitle>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-500"
						aria-label="닫기"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			</DialogHeader>

			<nav
				className="flex shrink-0 gap-1 border-gray-200 border-b"
				aria-label="탭 메뉴"
			>
				{TABS.map((tab) => {
					if (tab.id === "reflection" && !isTerminated) return null;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={`rounded-t-lg px-3 py-2 font-medium text-sm transition-colors ${
								activeTab === tab.id
									? "border-primary-600 border-b-2 bg-primary-50 text-primary-600"
									: "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
							}`}
							aria-current={activeTab === tab.id ? "page" : undefined}
						>
							{tab.label}
						</button>
					);
				})}
			</nav>

			<form
				onSubmit={handleSubmit}
				className="flex-1 space-y-4 overflow-y-auto p-4"
			>
				{activeTab === "basic" && (
					<BasicSection
						company={company}
						setCompany={setCompany}
						position={position}
						setPosition={setPosition}
						stage={stage}
						setStage={setStage}
						date={date}
						setDate={setDate}
						nextAction={nextAction}
						setNextAction={setNextAction}
						resumeId={resumeId}
						setResumeId={setResumeId}
						stages={stages}
						userResumes={userResumes}
					/>
				)}

				{activeTab === "intent" && (
					<IntentSection
						motivation={motivation}
						setMotivation={setMotivation}
						interestLevel={interestLevel}
						setInterestLevel={setInterestLevel}
						confidenceLevel={confidenceLevel}
						setConfidenceLevel={setConfidenceLevel}
					/>
				)}

				{activeTab === "strategy" && (
					<StrategySection
						resumeVersionNote={resumeVersionNote}
						setResumeVersionNote={setResumeVersionNote}
						positioningStrategy={positioningStrategy}
						setPositioningStrategy={setPositioningStrategy}
						emphasizedStrengths={emphasizedStrengths}
						newStrength={newStrength}
						setNewStrength={setNewStrength}
						addStrength={addStrength}
						removeStrength={removeStrength}
					/>
				)}

				{activeTab === "process" && (
					<ProcessSection
						steps={steps}
						showAddStep={showAddStep}
						setShowAddStep={setShowAddStep}
						editingStepId={editingStepId}
						setEditingStepId={setEditingStepId}
						onStepCreate={handleStepCreate}
						onStepUpdate={handleStepUpdate}
						onStepDelete={handleStepDelete}
						isLoading={stepsFetcher.state !== "idle"}
					/>
				)}

				{activeTab === "reflection" && isTerminated && (
					<ReflectionSection
						outcomeReason={outcomeReason}
						setOutcomeReason={setOutcomeReason}
						lessonsLearned={lessonsLearned}
						setLessonsLearned={setLessonsLearned}
						nextTimeChange={nextTimeChange}
						setNextTimeChange={setNextTimeChange}
					/>
				)}

				<div className="border-gray-200 border-t pt-4">
					<button
						type="submit"
						disabled={actionFetcher.state !== "idle"}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-bold text-white shadow-md transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50"
					>
						{actionFetcher.state !== "idle" ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								저장 중...
							</>
						) : (
							<>
								<Save className="h-4 w-4" />
								변경사항 저장
							</>
						)}
					</button>
				</div>
			</form>
		</>
	);
}

function BasicSection({
	company,
	setCompany,
	position,
	setPosition,
	stage,
	setStage,
	date,
	setDate,
	nextAction,
	setNextAction,
	resumeId,
	setResumeId,
	stages,
	userResumes,
}: {
	company: string;
	setCompany: (v: string) => void;
	position: string;
	setPosition: (v: string) => void;
	stage: PipelineStatus;
	setStage: (v: PipelineStatus) => void;
	date: string;
	setDate: (v: string) => void;
	nextAction: string;
	setNextAction: (v: string) => void;
	resumeId: string;
	setResumeId: (v: string) => void;
	stages: PipelineStage[];
	userResumes: Array<{
		id: string;
		title: string;
		type: string;
		status: string;
	}>;
}) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="detail-company"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					기업명
				</label>
				<input
					id="detail-company"
					type="text"
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					required
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label
					htmlFor="detail-position"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					포지션
				</label>
				<input
					id="detail-position"
					type="text"
					value={position}
					onChange={(e) => setPosition(e.target.value)}
					required
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="detail-stage"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						현재 단계
					</label>
					<select
						id="detail-stage"
						value={stage}
						onChange={(e) => setStage(e.target.value as PipelineStatus)}
						className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					>
						{stages.map((s) => (
							<option key={s.name} value={s.name}>
								{s.displayName}
							</option>
						))}
					</select>
				</div>
				<div>
					<label
						htmlFor="detail-date"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						날짜
					</label>
					<input
						id="detail-date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="detail-nextAction"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					다음 할 일
				</label>
				<input
					id="detail-nextAction"
					type="text"
					value={nextAction}
					onChange={(e) => setNextAction(e.target.value)}
					placeholder="예: 3일 뒤 팔로우업 메일 보내기"
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			{userResumes.length > 0 && (
				<div>
					<label
						htmlFor="detail-resumeId"
						className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
					>
						이력서 연결
					</label>
					<select
						id="detail-resumeId"
						value={resumeId}
						onChange={(e) => setResumeId(e.target.value)}
						className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					>
						<option value="">선택 안 함</option>
						{userResumes.map((doc) => (
							<option key={doc.id} value={doc.id}>
								{doc.title}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}

function IntentSection({
	motivation,
	setMotivation,
	interestLevel,
	setInterestLevel,
	confidenceLevel,
	setConfidenceLevel,
}: {
	motivation: string;
	setMotivation: (v: string) => void;
	interestLevel: InterestLevelValue | "";
	setInterestLevel: (v: InterestLevelValue | "") => void;
	confidenceLevel: ConfidenceLevelValue | "";
	setConfidenceLevel: (v: ConfidenceLevelValue | "") => void;
}) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="detail-motivation"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					지원 동기
				</label>
				<textarea
					id="detail-motivation"
					value={motivation}
					onChange={(e) => setMotivation(e.target.value.slice(0, 500))}
					placeholder="왜 이 회사/포지션에 지원했나요?"
					rows={4}
					className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
				<p className="mt-1 text-gray-400 text-xs">{motivation.length}/500</p>
			</div>

			<fieldset>
				<legend className="mb-2 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
					관심도
				</legend>
				<div className="flex gap-3">
					{INTEREST_OPTIONS.map((opt) => (
						<label
							key={opt.value}
							className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
								interestLevel === opt.value
									? "border-primary-500 bg-primary-50 text-primary-700"
									: "border-gray-200 hover:bg-gray-50"
							}`}
						>
							<input
								type="radio"
								name="interestLevel"
								value={opt.value}
								checked={interestLevel === opt.value}
								onChange={() => setInterestLevel(opt.value)}
								className="sr-only"
							/>
							<span className="font-medium text-sm">{opt.label}</span>
						</label>
					))}
				</div>
			</fieldset>

			<fieldset>
				<legend className="mb-2 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
					자신감 수준
				</legend>
				<div className="flex gap-3">
					{CONFIDENCE_OPTIONS.map((opt) => (
						<label
							key={opt.value}
							className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
								confidenceLevel === opt.value
									? "border-primary-500 bg-primary-50 text-primary-700"
									: "border-gray-200 hover:bg-gray-50"
							}`}
						>
							<input
								type="radio"
								name="confidenceLevel"
								value={opt.value}
								checked={confidenceLevel === opt.value}
								onChange={() => setConfidenceLevel(opt.value)}
								className="sr-only"
							/>
							<span className="font-medium text-sm">{opt.label}</span>
						</label>
					))}
				</div>
			</fieldset>
		</div>
	);
}

function StrategySection({
	resumeVersionNote,
	setResumeVersionNote,
	positioningStrategy,
	setPositioningStrategy,
	emphasizedStrengths,
	newStrength,
	setNewStrength,
	addStrength,
	removeStrength,
}: {
	resumeVersionNote: string;
	setResumeVersionNote: (v: string) => void;
	positioningStrategy: string;
	setPositioningStrategy: (v: string) => void;
	emphasizedStrengths: string[];
	newStrength: string;
	setNewStrength: (v: string) => void;
	addStrength: () => void;
	removeStrength: (v: string) => void;
}) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="detail-resumeVersion"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					사용 이력서 버전
				</label>
				<input
					id="detail-resumeVersion"
					type="text"
					value={resumeVersionNote}
					onChange={(e) => setResumeVersionNote(e.target.value)}
					placeholder="예: 프론트엔드 특화 v2, 일본어 강조 버전"
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label
					htmlFor="detail-positioning"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					포지셔닝 전략
				</label>
				<textarea
					id="detail-positioning"
					value={positioningStrategy}
					onChange={(e) => setPositioningStrategy(e.target.value)}
					placeholder="이 지원에서 어떤 전략을 사용했나요?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label
					htmlFor="detail-newStrength"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					강조한 강점
				</label>
				<div className="mb-2 flex flex-wrap gap-2">
					{emphasizedStrengths.map((s) => (
						<span
							key={s}
							className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700 text-sm"
						>
							{s}
							<button
								type="button"
								onClick={() => removeStrength(s)}
								className="hover:text-primary-900"
								aria-label={`${s} 제거`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="detail-newStrength"
						type="text"
						value={newStrength}
						onChange={(e) => setNewStrength(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addStrength();
							}
						}}
						placeholder="강점 추가 (Enter)"
						className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
					<button
						type="button"
						onClick={addStrength}
						className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200"
						aria-label="강점 추가"
					>
						<Plus className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

function ProcessSection({
	steps,
	showAddStep,
	setShowAddStep,
	editingStepId,
	setEditingStepId,
	onStepCreate,
	onStepUpdate,
	onStepDelete,
	isLoading,
}: {
	steps: ApplicationStep[];
	showAddStep: boolean;
	setShowAddStep: (v: boolean) => void;
	editingStepId: string | null;
	setEditingStepId: (v: string | null) => void;
	onStepCreate: (data: {
		stepType: StepTypeValue;
		date: string;
		summary: string;
		selfEvaluation: string;
	}) => void;
	onStepUpdate: (
		stepId: string,
		data: {
			stepType: StepTypeValue;
			date: string;
			summary: string;
			selfEvaluation: string;
		},
	) => void;
	onStepDelete: (stepId: string) => void;
	isLoading: boolean;
}) {
	const sorted = [...steps].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-gray-600 text-sm">
					면접, 과제 전형 등 진행 단계를 기록합니다.
				</p>
				<button
					type="button"
					onClick={() => setShowAddStep(true)}
					disabled={showAddStep}
					className="flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700 disabled:opacity-50"
				>
					<Plus className="h-4 w-4" />
					단계 추가
				</button>
			</div>

			{showAddStep && (
				<StepFormCard
					onSubmit={onStepCreate}
					onCancel={() => setShowAddStep(false)}
					isLoading={isLoading}
				/>
			)}

			{sorted.length === 0 && !showAddStep && (
				<div className="py-8 text-center text-gray-400">
					<Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
					<p className="text-sm">아직 기록된 진행 단계가 없습니다.</p>
				</div>
			)}

			<div className="space-y-2">
				{sorted.map((step) =>
					editingStepId === step.id ? (
						<StepFormCard
							key={step.id}
							initialData={step}
							onSubmit={(data) => onStepUpdate(step.id, data)}
							onCancel={() => setEditingStepId(null)}
							isLoading={isLoading}
						/>
					) : (
						<StepDisplayCard
							key={step.id}
							step={step}
							onEdit={() => setEditingStepId(step.id)}
							onDelete={() => onStepDelete(step.id)}
						/>
					),
				)}
			</div>
		</div>
	);
}

function StepDisplayCard({
	step,
	onEdit,
	onDelete,
}: {
	step: ApplicationStep;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const typeLabel =
		STEP_TYPE_OPTIONS.find((t) => t.value === step.stepType)?.label ||
		step.stepType;

	return (
		<div className="group rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<div className="mb-1 flex items-center gap-2">
						<span className="inline-flex rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700 text-xs">
							{typeLabel}
						</span>
						<span className="text-gray-500 text-xs">{step.date}</span>
					</div>
					<p className="text-gray-800 text-sm">{step.summary}</p>
					{step.selfEvaluation && (
						<p className="mt-1 text-gray-500 text-xs italic">
							{step.selfEvaluation}
						</p>
					)}
				</div>
				<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<button
						type="button"
						onClick={onEdit}
						className="p-1 text-gray-400 hover:text-gray-600"
						aria-label="수정"
					>
						<Pencil className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="p-1 text-gray-400 hover:text-red-500"
						aria-label="삭제"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

function StepFormCard({
	initialData,
	onSubmit,
	onCancel,
	isLoading,
}: {
	initialData?: ApplicationStep;
	onSubmit: (data: {
		stepType: StepTypeValue;
		date: string;
		summary: string;
		selfEvaluation: string;
	}) => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	const initType = (initialData?.stepType as StepTypeValue) || "interview";
	const [stepType, setStepType] = useState<StepTypeValue>(initType);
	const [date, setDate] = useState(
		initialData?.date || new Date().toISOString().split("T")[0],
	);
	const [summary, setSummary] = useState(initialData?.summary || "");
	const [selfEvaluation, setSelfEvaluation] = useState(
		initialData?.selfEvaluation || "",
	);

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ stepType, date, summary, selfEvaluation });
	};

	return (
		<div className="rounded-lg border border-primary-200 bg-primary-50/30 p-3">
			<div className="mb-3 grid grid-cols-2 gap-3">
				<div>
					<label
						htmlFor="step-type"
						className="mb-1 block font-medium text-gray-600 text-xs"
					>
						유형
					</label>
					<select
						id="step-type"
						value={stepType}
						onChange={(e) => setStepType(e.target.value as StepTypeValue)}
						className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					>
						{STEP_TYPE_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label
						htmlFor="step-date"
						className="mb-1 block font-medium text-gray-600 text-xs"
					>
						날짜
					</label>
					<input
						id="step-date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
					/>
				</div>
			</div>
			<div className="mb-3">
				<label
					htmlFor="step-summary"
					className="mb-1 block font-medium text-gray-600 text-xs"
				>
					요약
				</label>
				<input
					id="step-summary"
					type="text"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					placeholder="면접 내용, 과제 주제 등"
					required
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>
			<div className="mb-3">
				<label
					htmlFor="step-eval"
					className="mb-1 block font-medium text-gray-600 text-xs"
				>
					자기 평가 (선택)
				</label>
				<input
					id="step-eval"
					type="text"
					value={selfEvaluation}
					onChange={(e) => setSelfEvaluation(e.target.value)}
					placeholder="느낀 점, 개선할 점 등"
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
				>
					취소
				</button>
				<button
					type="button"
					onClick={handleFormSubmit}
					disabled={isLoading || !summary.trim()}
					className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
				>
					{isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
					{initialData ? "수정" : "추가"}
				</button>
			</div>
		</div>
	);
}

function ReflectionSection({
	outcomeReason,
	setOutcomeReason,
	lessonsLearned,
	setLessonsLearned,
	nextTimeChange,
	setNextTimeChange,
}: {
	outcomeReason: string;
	setOutcomeReason: (v: string) => void;
	lessonsLearned: string;
	setLessonsLearned: (v: string) => void;
	nextTimeChange: string;
	setNextTimeChange: (v: string) => void;
}) {
	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
				<p className="text-amber-800 text-sm">
					이 지원이 종료되었습니다. 경험을 정리하고 다음 지원에 반영해보세요.
				</p>
			</div>

			<div>
				<label
					htmlFor="detail-outcomeReason"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					결과의 원인
				</label>
				<textarea
					id="detail-outcomeReason"
					value={outcomeReason}
					onChange={(e) => setOutcomeReason(e.target.value)}
					placeholder="왜 이런 결과가 나왔다고 생각하나요?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label
					htmlFor="detail-lessonsLearned"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					배운 점
				</label>
				<textarea
					id="detail-lessonsLearned"
					value={lessonsLearned}
					onChange={(e) => setLessonsLearned(e.target.value)}
					placeholder="이 경험에서 무엇을 배웠나요?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label
					htmlFor="detail-nextTimeChange"
					className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider"
				>
					다음에 바꿀 점
				</label>
				<textarea
					id="detail-nextTimeChange"
					value={nextTimeChange}
					onChange={(e) => setNextTimeChange(e.target.value)}
					placeholder="다음 지원에서는 무엇을 다르게 할 건가요?"
					rows={3}
					className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>
		</div>
	);
}
