import {
	Popover as HeadlessPopover,
	PopoverButton,
	type PopoverButtonProps,
	PopoverPanel,
	type PopoverPanelProps,
} from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

export const Popover = HeadlessPopover;

interface PopoverTriggerProps extends PopoverButtonProps {
	className?: string;
	children: ReactNode;
}

export function PopoverTrigger({
	className,
	children,
	...props
}: PopoverTriggerProps) {
	return (
		<PopoverButton as={Fragment} {...props}>
			<button type="button" className={cn("focus:outline-none", className)}>
				{children}
			</button>
		</PopoverButton>
	);
}

export function PopoverContent({
	className,
	children,
	anchor = "bottom end",
	...props
}: PopoverPanelProps) {
	return (
		<PopoverPanel
			transition
			anchor={anchor}
			className={cn(
				"z-50 min-w-[20rem] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5",
				"transition duration-200 ease-out [--anchor-gap:8px]",
				"data-[closed]:scale-95 data-[closed]:opacity-0",
				className,
			)}
			{...props}
		>
			{children}
		</PopoverPanel>
	);
}
