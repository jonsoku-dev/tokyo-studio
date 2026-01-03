import type { WidgetId, WidgetLayout } from "@itcom/db/schema";
import { EyeOff, Maximize2, Minimize2, Settings2 } from "lucide-react";
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
	onResize?: (widgetId: string, newSize: WidgetLayout["size"]) => void;
	onHide?: (widgetId: string) => void;
}

/**
 * Widget Actions Menu
 * 위젯별 설정 드롭다운 (크기 조절, 숨기기)
 * 콜백을 통해 즉시 UI 업데이트
 */
export function WidgetActions({
	widgetId,
	currentSize,
	onResize,
	onHide,
}: WidgetActionsProps) {
	const metadata = getWidgetMetadata(widgetId);

	/**
	 * 크기 변경
	 */
	const handleResize = (newSize: WidgetLayout["size"]) => {
		if (onResize) {
			onResize(widgetId, newSize);
		}
	};

	/**
	 * 위젯 숨기기
	 */
	const handleHide = () => {
		if (onHide) {
			onHide(widgetId);
		}
	};

	// 가능한 크기 옵션 (작게 제거)
	const sizeOptions: Array<{
		value: WidgetLayout["size"];
		label: string;
		icon: typeof Maximize2;
	}> = [
		{ value: "standard", label: "보통", icon: Settings2 },
		{ value: "expanded", label: "크게", icon: Maximize2 },
	];

	// 현재 위젯이 허용하는 크기 필터링
	const availableSizes = sizeOptions.filter((option) => {
		// compact는 UI에서 제외되었으므로 standard부터 시작한다고 가정
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
					const isActive = currentSize === option.value;
					return (
						<DropdownItem
							key={option.value}
							disabled={isActive}
							onClick={() => handleResize(option.value)}
						>
							<Icon className="mr-2 h-4 w-4" />
							{option.label}
							{isActive && <span className="ml-auto text-primary-600">✓</span>}
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
