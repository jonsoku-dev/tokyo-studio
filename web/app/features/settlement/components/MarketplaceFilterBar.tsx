import { ChevronDown, Filter, X } from "lucide-react";
import {
	Dropdown,
	DropdownButton,
	DropdownContent,
	DropdownItem,
} from "~/shared/components/ui/Dropdown";

interface MarketplaceFilterBarProps {
	targetVisa: string;
	familyStatus: string;
	region: string;
	onVisaChange: (value: string) => void;
	onFamilyChange: (value: string) => void;
	onRegionChange: (value: string) => void;
	onReset: () => void;
}

export function MarketplaceFilterBar({
	targetVisa,
	familyStatus,
	region,
	onVisaChange,
	onFamilyChange,
	onRegionChange,
	onReset,
}: MarketplaceFilterBarProps) {
	const hasActiveFilters =
		targetVisa !== "all" || familyStatus !== "all" || region !== "all";

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2 text-gray-600">
					<Filter className="h-4 w-4" />
					<span className="font-medium text-sm">필터</span>
				</div>

				<FilterDropdown
					label={targetVisa === "all" ? "비자 유형" : targetVisa}
					value={targetVisa}
					options={[
						{ value: "all", label: "전체 비자" },
						{ value: "Engineer", label: "기술/인문지식/국제업무" },
						{ value: "Student", label: "유학" },
						{ value: "Working Holiday", label: "워킹홀리데이" },
						{ value: "Dependent", label: "가족체재" },
						{ value: "HSP", label: "고도인재" },
						{ value: "Spouse", label: "일본인의 배우자" },
						{ value: "Other", label: "기타" },
					]}
					onChange={onVisaChange}
				/>

				<FilterDropdown
					label={familyStatus === "all" ? "가족 형태" : familyStatus}
					value={familyStatus}
					options={[
						{ value: "all", label: "전체 가족 형태" },
						{ value: "Single", label: "1인 (싱글)" },
						{ value: "Couple", label: "2인 (부부/커플)" },
						{ value: "Family with Kids", label: "자녀 동반" },
						{ value: "Pet Owner", label: "반려동물 동반" },
					]}
					onChange={onFamilyChange}
				/>

				<FilterDropdown
					label={region === "all" ? "지역" : region}
					value={region}
					options={[
						{ value: "all", label: "전체 지역" },
						{ value: "Tokyo", label: "도쿄 (Tokyo)" },
						{ value: "Osaka", label: "오사카 (Osaka)" },
						{ value: "Fukuoka", label: "후쿠오카 (Fukuoka)" },
						{ value: "Nagoya", label: "나고야 (Nagoya)" },
						{ value: "Remote", label: "기타/원격" },
					]}
					onChange={onRegionChange}
				/>

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

function FilterDropdown({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: { value: string; label: string }[];
	value: string;
	onChange: (value: string) => void;
}) {
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
