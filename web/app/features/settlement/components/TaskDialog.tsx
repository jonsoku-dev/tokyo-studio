import type {
	SettlementCategory,
	SettlementPhase,
	SettlementTaskTemplate,
} from "@itcom/db/schema";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
	SelectTrigger,
	SelectValue,
} from "~/shared/components/ui/Select";
import { cn } from "~/shared/utils/cn";

interface TaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: SettlementTaskTemplate | null;
	phases: SettlementPhase[];
	categories: SettlementCategory[];
	onSubmit: (data: {
		title: string;
		phaseId: string;
		category: string;
		dayOffset: number;
	}) => void;
	onDelete?: () => void;
	defaultPhaseId?: string;
}

export function TaskDialog({
	open,
	onOpenChange,
	initialData,
	phases,
	categories,
	onSubmit,
	onDelete,
	defaultPhaseId,
}: TaskDialogProps) {
	const isEdit = !!initialData;

	// Initial State
	const [title, setTitle] = useState(initialData?.title || "");
	const [phaseId, setPhaseId] = useState(
		initialData?.phaseId || defaultPhaseId || phases[0]?.id || "",
	);
	const [category, setCategory] = useState(
		initialData?.category || categories[0]?.slug || "government",
	);

	// Prepare Options
	const phaseOptions = useMemo(
		() =>
			phases.map((p) => ({
				label: <span className="font-medium">{p.titleKo}</span>,
				value: p.id,
			})),
		[phases],
	);

	const categoryOptions = useMemo(
		() =>
			categories.map((c) => ({
				label: (
					<>
						<span className="mr-2">{c.icon}</span>
						{c.titleKo}
					</>
				),
				value: c.slug,
			})),
		[categories],
	);

	// Derived Phase Data
	const selectedPhase = phases.find((p) => p.id === phaseId);
	const allowBefore = selectedPhase ? selectedPhase.minDays < 0 : true;
	const allowAfter = selectedPhase ? selectedPhase.maxDays >= 0 : true;

	// Logic for Before/After splitting
	const initialDayOffset = initialData?.dayOffset ?? 0;
	const [daysOffset, setDaysOffset] = useState(Math.abs(initialDayOffset));
	const [direction, setDirection] = useState<"before" | "after">(
		initialDayOffset < 0 ? "before" : "after",
	);

	// Calculate Range Limits based on Phase and Direction
	let minInput = 0;
	let maxInput = 9999;

	if (selectedPhase) {
		if (direction === "before") {
			const validMax = Math.min(selectedPhase.maxDays, -1);
			const validMin = selectedPhase.minDays;
			minInput = Math.max(1, -validMax);
			maxInput = Math.max(1, -validMin);
		} else {
			const validMin = Math.max(selectedPhase.minDays, 0);
			const validMax = selectedPhase.maxDays;
			minInput = validMin;
			maxInput = validMax;
		}
	}

	// Validate & Clamp on Phase Change or Direction Change
	useEffect(() => {
		if (!selectedPhase) return;

		// 1. Enforce Direction
		let newDirection = direction;
		if (direction === "before" && !allowBefore) {
			newDirection = "after";
			setDirection("after");
		} else if (direction === "after" && !allowAfter) {
			newDirection = "before";
			setDirection("before");
		}

		// 2. Enforce Range (Recalculate limits for new direction)
		let currentMin = 0;
		let currentMax = 9999;
		if (newDirection === "before") {
			const validMax = Math.min(selectedPhase.maxDays, -1);
			const validMin = selectedPhase.minDays;
			currentMin = Math.max(1, -validMax);
			currentMax = Math.max(1, -validMin);
		} else {
			const validMin = Math.max(selectedPhase.minDays, 0);
			const validMax = selectedPhase.maxDays;
			currentMin = validMin;
			currentMax = validMax;
		}

		setDaysOffset((prev) => {
			if (prev < currentMin) return currentMin;
			if (prev > currentMax) return currentMax;
			return prev;
		});
	}, [selectedPhase, direction, allowBefore, allowAfter]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const finalDays = direction === "before" ? -daysOffset : daysOffset;
		onSubmit({
			title,
			phaseId,
			category,
			dayOffset: finalDays,
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="font-bold text-xl">
						{isEdit ? "할 일 수정" : "새 할 일 추가"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="stack-md mt-4">
					{/* Title Section (Prominent) */}
					<div className="stack-xs">
						<Label className="text-gray-500">제목</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							placeholder="예: 구청 전입신고"
							className="py-6 font-medium text-lg"
						/>
					</div>

					<div className="grid grid-cols-2 gap-responsive">
						{/* Phase Selection */}
						<div className="stack-xs">
							<Label className="text-gray-500">시기 (Phase)</Label>
							<Select
								value={phaseId}
								onValueChange={setPhaseId}
								disabled={!isEdit && !!defaultPhaseId}
								options={phaseOptions}
							>
								<SelectTrigger className="h-12 border-gray-200 bg-gray-50">
									<SelectValue placeholder="시기 선택" />
								</SelectTrigger>
								<SelectContent />
							</Select>
						</div>

						{/* Category Selection */}
						<div className="stack-xs">
							<Label className="text-gray-500">카테고리</Label>
							<Select
								value={category}
								onValueChange={setCategory}
								options={categoryOptions}
							>
								<SelectTrigger className="h-12 border-gray-200 bg-gray-50">
									<SelectValue placeholder="카테고리 선택" />
								</SelectTrigger>
								<SelectContent />
							</Select>
						</div>
					</div>

					{/* Timing Section - Redesigned */}
					<div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
						<Label className="mb-3 block text-gray-500">타이밍 설정</Label>

						<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
							{/* Number Input */}
							<div className="relative">
								<span className="absolute top-1/2 left-3 -translate-y-1/2 font-bold text-gray-400">
									D-
								</span>
								<Input
									type="number"
									value={daysOffset}
									onChange={(e) => {
										// Allow typing freely, clamping happens on blur or submit if needed
										// But for UX, maybe just limit max length or something?
										// HTML min/max will handle validation visualization usually.
										setDaysOffset(Number(e.target.value));
									}}
									onBlur={() => {
										// Clamp on blur
										if (daysOffset < minInput) setDaysOffset(minInput);
										if (daysOffset > maxInput) setDaysOffset(maxInput);
									}}
									className="h-12 pl-9 text-center font-bold text-lg"
									min={minInput}
									max={maxInput}
								/>
							</div>

							<span className="font-medium text-gray-400 text-sm">일</span>

							{/* Before/After Toggle */}
							<div className="flex rounded-lg border border-gray-200 bg-white p-1">
								<button
									type="button"
									onClick={() => setDirection("before")}
									disabled={!allowBefore}
									className={cn(
										"flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 font-medium text-sm transition-all",
										direction === "before"
											? "bg-red-50 text-red-600 shadow-sm"
											: "text-gray-400 hover:text-gray-600",
										!allowBefore && "cursor-not-allowed opacity-50",
									)}
								>
									<ArrowLeft className="h-3 w-3" />
									입국 전
								</button>
								<button
									type="button"
									onClick={() => setDirection("after")}
									disabled={!allowAfter}
									className={cn(
										"flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 font-medium text-sm transition-all",
										direction === "after"
											? "bg-green-50 text-green-600 shadow-sm"
											: "text-gray-400 hover:text-gray-600",
										!allowAfter && "cursor-not-allowed opacity-50",
									)}
								>
									입국 후
									<ArrowRight className="h-3 w-3" />
								</button>
							</div>
						</div>
						<div className="mt-2 text-center text-gray-400 text-muted-foreground text-xs">
							{selectedPhase
								? `* ${selectedPhase.titleKo} 기간: ${selectedPhase.minDays}일 ~ ${selectedPhase.maxDays}일`
								: ""}
						</div>
					</div>

					<DialogFooter className="mt-4 gap-2 border-gray-100 border-t pt-4">
						{isEdit && onDelete && (
							<Button
								type="button"
								variant="ghost"
								onClick={onDelete}
								className="mr-auto gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
							>
								<Trash2 className="h-4 w-4" />
								삭제
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="text-gray-500"
						>
							취소
						</Button>
						<Button
							type="submit"
							className="min-w-[80px] bg-primary-600 hover:bg-primary-700"
						>
							{isEdit ? "수정 완료" : "추가하기"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
