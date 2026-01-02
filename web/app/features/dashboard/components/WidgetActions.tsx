import type { WidgetId, WidgetLayout } from "@itcom/db/schema";
import { EyeOff, Maximize2, Minimize2, Settings2 } from "lucide-react";
import { useFetcher } from "react-router";
import {
	Dropdown,
	DropdownButton,
	DropdownContent,
	DropdownItem,
	DropdownSeparator,
} from "~/shared/components/ui/Dropdown";
import { getWidgetMetadata } from "../config/widget-metadata";

interface WidgetActionsProps {
	widgetId: WidgetId;
	currentSize: WidgetLayout["size"];
}

/**
 * Widget Actions Menu
 * 위젯별 설정 드롭다운 (크기 조절, 숨기기)
 */
export function WidgetActions({ widgetId, currentSize }: WidgetActionsProps) {
	const fetcher = useFetcher();
	const metadata = getWidgetMetadata(widgetId);

	/**
	 * 크기 변경
	 */
	const handleResize = (newSize: WidgetLayout["size"]) => {
		fetcher.submit(
			{
				action: "resize",
				widgetId,
				size: newSize,
			},
			{
				method: "post",
				action: "/api/dashboard/widgets",
			},
		);
	};

	/**
	 * 위젯 숨기기
	 */
	const handleHide = () => {
		fetcher.submit(
			{
				action: "hide",
				widgetId,
			},
			{
				method: "post",
				action: "/api/dashboard/widgets",
			},
		);
	};

	// 가능한 크기 옵션
	const sizeOptions: Array<{
		value: WidgetLayout["size"];
		label: string;
		icon: typeof Maximize2;
	}> = [
		{ value: "compact", label: "작게", icon: Minimize2 },
		{ value: "standard", label: "보통", icon: Settings2 },
		{ value: "expanded", label: "크게", icon: Maximize2 },
	];

	// 현재 위젯이 허용하는 크기 필터링
	const availableSizes = sizeOptions.filter((option) => {
		const sizeOrder = ["compact", "standard", "expanded"];
		const minIndex = sizeOrder.indexOf(metadata.minSize);
		const maxIndex = sizeOrder.indexOf(metadata.maxSize);
		const optionIndex = sizeOrder.indexOf(option.value);

		return optionIndex >= minIndex && optionIndex <= maxIndex;
	});

	return (
		<Dropdown>
			<DropdownButton className="!bg-transparent rounded-md p-1.5 transition-colors hover:bg-gray-100">
				<Settings2 className="h-4 w-4 text-gray-500" />
			</DropdownButton>

			<DropdownContent>
				{/* 크기 조절 */}
				<div className="px-2 py-1.5 font-semibold text-gray-500 text-xs">
					크기
				</div>
				{availableSizes.map((option) => {
					const Icon = option.icon;
					return (
						<DropdownItem
							key={option.value}
							disabled={currentSize === option.value}
							onClick={() => handleResize(option.value)}
						>
							<Icon className="mr-2 h-4 w-4" />
							{option.label}
							{currentSize === option.value && (
								<span className="ml-auto text-primary-600">✓</span>
							)}
						</DropdownItem>
					);
				})}

				<DropdownSeparator />

				{/* 숨기기 */}
				<DropdownItem onClick={handleHide}>
					<EyeOff className="mr-2 h-4 w-4" />
					숨기기
				</DropdownItem>
			</DropdownContent>
		</Dropdown>
	);
}
