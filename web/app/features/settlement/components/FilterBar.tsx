import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Fragment } from "react";

export type FilterCategory =
	| "all"
	| "government"
	| "housing"
	| "finance"
	| "utilities"
	| "other";
export type FilterStatus = "all" | "pending" | "completed";
export type FilterUrgency = "all" | "urgent";

interface FilterBarProps {
	category: FilterCategory;
	status: FilterStatus;
	urgency: FilterUrgency;
	onCategoryChange: (category: FilterCategory) => void;
	onStatusChange: (status: FilterStatus) => void;
	onUrgencyChange: (urgency: FilterUrgency) => void;
	onReset: () => void;
}

const categoryLabels: Record<FilterCategory, string> = {
	all: "전체 카테고리",
	government: "🏛️ 관공서",
	housing: "🏠 주거",
	finance: "💰 금융",
	utilities: "⚡ 유틸리티",
	other: "📦 기타",
};

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
	onCategoryChange,
	onStatusChange,
	onUrgencyChange,
	onReset,
}: FilterBarProps) {
	const hasActiveFilters =
		category !== "all" || status !== "all" || urgency !== "all";

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2 text-gray-600">
					<Filter className="w-4 h-4" />
					<span className="text-sm font-medium">필터</span>
				</div>

				{/* Category Filter */}
				<FilterDropdown
					label={categoryLabels[category]}
					options={Object.entries(categoryLabels).map(([value, label]) => ({
						value: value as FilterCategory,
						label,
					}))}
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
						className="flex items-center gap-1 px-3 py-1.5 caption hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<X className="w-3 h-3" />
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

function FilterDropdown<T extends string>({
	label,
	options,
	value,
	onChange,
}: FilterDropdownProps<T>) {
	const isActive = value !== "all";

	return (
		<Menu as="div" className="relative">
			<Menu.Button
				className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
					isActive
						? "bg-primary-100 text-primary-700"
						: "bg-gray-100 text-gray-600 hover:bg-gray-200"
				}`}
			>
				{label}
				<ChevronDown className="w-3.5 h-3.5" />
			</Menu.Button>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left card-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 overflow-hidden">
					{options.map((option) => (
						<Menu.Item key={option.value}>
							{({ active }) => (
								<button
									type="button"
									onClick={() => onChange(option.value)}
									className={`w-full text-left px-4 py-2.5 text-sm ${
										active ? "bg-gray-50" : ""
									} ${option.value === value ? "text-primary-600 font-medium" : "text-gray-700"}`}
								>
									{option.label}
								</button>
							)}
						</Menu.Item>
					))}
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
