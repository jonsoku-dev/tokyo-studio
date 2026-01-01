import type { SettlementCategory } from "@itcom/db/schema";
import { ChevronDown, Filter, X } from "lucide-react";

export type FilterCategory = string;
export type FilterStatus = "all" | "pending" | "completed";
export type FilterUrgency = "all" | "urgent";

interface FilterBarProps {
	category: FilterCategory;
	status: FilterStatus;
	urgency: FilterUrgency;
	categories: SettlementCategory[];
	onCategoryChange: (category: FilterCategory) => void;
	onStatusChange: (status: FilterStatus) => void;
	onUrgencyChange: (urgency: FilterUrgency) => void;
	onReset: () => void;
}

const statusLabels: Record<FilterStatus, string> = {
	all: "전체 상태",
	pending: "⏳ 미완료",
	completed: "✅ 완료",
};

const urgencyLabels: Record<FilterUrgency, string> = {
	all: "전체",
	urgent: "🔥 긴급",
};

export function FilterBar({
	category,
	status,
	urgency,
	categories,
	onCategoryChange,
	onStatusChange,
	onUrgencyChange,
	onReset,
}: FilterBarProps) {
	const hasActiveFilters =
		category !== "all" || status !== "all" || urgency !== "all";

	// Create category options
	const categoryOptions = [
		{ value: "all", label: "전체 카테고리" },
		...categories.map((c) => ({
			value: c.slug,
			label: `${c.icon} ${c.titleKo}`,
		})),
	];

	const selectedCategoryLabel =
		category === "all"
			? "전체 카테고리"
			: categories.find((c) => c.slug === category)
				? `${categories.find((c) => c.slug === category)?.icon} ${categories.find((c) => c.slug === category)?.titleKo}`
				: category;

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2 text-gray-600">
					<Filter className="h-4 w-4" />
					<span className="font-medium text-sm">필터</span>
				</div>

				{/* Category Filter */}
				<FilterDropdown
					label={selectedCategoryLabel}
					options={categoryOptions}
					value={category}
					onChange={onCategoryChange}
				/>

				{/* Status Filter */}
				<FilterDropdown
					label={statusLabels[status]}
					options={Object.entries(statusLabels).map(([value, label]) => ({
						value: value as FilterStatus,
						label,
					}))}
					value={status}
					onChange={onStatusChange}
				/>

				{/* Urgency Filter */}
				<FilterDropdown
					label={urgencyLabels[urgency]}
					options={Object.entries(urgencyLabels).map(([value, label]) => ({
						value: value as FilterUrgency,
						label,
					}))}
					value={urgency}
					onChange={onUrgencyChange}
				/>

				{/* Reset Button */}
				{hasActiveFilters && (
					<button
						type="button"
						onClick={onReset}
						className="caption flex items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-100 hover:text-gray-700"
					>
						<X className="h-3 w-3" />
						초기화
					</button>
				)}
			</div>
		</div>
	);
}

interface FilterDropdownProps<T extends string> {
	label: string;
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
}

import {
	Dropdown,
	DropdownButton,
	DropdownContent,
	DropdownItem,
} from "~/shared/components/ui/Dropdown";

// ... (FilterBar component code)

function FilterDropdown<T extends string>({
	label,
	options,
	value,
	onChange,
}: FilterDropdownProps<T>) {
	const isActive = value !== "all";

	return (
		<Dropdown>
			<DropdownButton
				className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${
					isActive
						? "bg-primary-100 text-primary-700"
						: "bg-gray-100 text-gray-600 hover:bg-gray-200"
				}`}
			>
				{label}
				<ChevronDown className="h-3.5 w-3.5" />
			</DropdownButton>

			<DropdownContent className="w-48">
				{options.map((option) => (
					<DropdownItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className={`w-full text-left ${
							option.value === value
								? "bg-gray-50 font-medium text-primary-600"
								: "text-gray-700"
						}`}
					>
						{option.label}
					</DropdownItem>
				))}
			</DropdownContent>
		</Dropdown>
	);
}
