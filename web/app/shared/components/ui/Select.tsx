"use client";

import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { useControllableState } from "~/shared/hooks/useControllableState";
import { cn } from "~/shared/utils/cn";

export interface SelectOption<T = any> {
	label: string | React.ReactNode;
	value: T;
	disabled?: boolean;
}

type SelectContextType<T> = {
	value?: T;
	onValueChange: (value: T) => void;
	options?: SelectOption<T>[];
	disabled?: boolean;
	name?: string;
};

const SelectContext = React.createContext<SelectContextType<any> | undefined>(
	undefined,
);

function useSelectContext<T>() {
	const context = React.useContext(SelectContext);
	if (!context) {
		throw new Error("Select compound components must be used within a Select");
	}
	return context as SelectContextType<T>;
}

export interface SelectProps<T> {
	value?: T;
	defaultValue?: T;
	onValueChange?: (value: T) => void;
	disabled?: boolean;
	name?: string;
	children?: React.ReactNode;
	options?: SelectOption<T>[];
	className?: string; // Wrapper style
}

export function Select<T>({
	value: valueProp,
	defaultValue,
	onValueChange,
	disabled,
	name,
	children,
	options,
	className,
}: SelectProps<T>) {
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue,
		onChange: onValueChange,
	});

	return (
		<SelectContext.Provider
			value={{
				value,
				onValueChange: setValue,
				options,
				disabled,
				name,
			}}
		>
			<Listbox
				value={value}
				onChange={setValue}
				disabled={disabled}
				name={name}
			>
				<div className={cn("relative w-full", className)}>{children}</div>
			</Listbox>
		</SelectContext.Provider>
	);
}

export function SelectTrigger({
	className,
	children,
	id,
}: {
	className?: string;
	children: React.ReactNode;
	id?: string;
}) {
	// Headless UI ListboxButton handles disabled state interactions (aria-disabled).
	// We add visual styles for disabled state via data attributes.
	return (
		<ListboxButton
			id={id}
			className={cn(
				"group flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				// Fix #7 Focus Ring Conflict: Ensure data-[open] style coordinates with focus ring
				"data-[open]:border-primary-500 data-[open]:ring-2 data-[open]:ring-primary-100",
				className,
			)}
		>
			{children}
			{/* Fix #6 Icon Rotation */}
			<ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[open]:rotate-180" />
		</ListboxButton>
	);
}

export function SelectValue({
	placeholder,
	children,
	className,
}: {
	placeholder?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	const { value, options } = useSelectContext<any>();

	// Fix #5 Falsy Value & #3 Trigger Updates
	// Priority:
	// 1. Children (Explicit override) - BE CAREFUL: if children are static, they won't update
	// 2. Option Label (if options provided and value matches)
	// 3. Value itself (if strictly scalar)
	// 4. Placeholder

	let content: React.ReactNode = null;

	if (children) {
		content = children;
	} else if (options && value !== undefined && value !== null) {
		// Fix #2 Type Generic/Object comparison: simplistic equality check for now.
		// Complex objects might need deep equality or 'by' prop in Listbox, but strict mode encourages scalar IDs.
		const selectedOption = options.find((opt) => opt.value === value);
		if (selectedOption) {
			content = selectedOption.label;
		}
	} else if (
		value !== undefined &&
		value !== null &&
		(typeof value === "string" || typeof value === "number")
	) {
		// Fallback for primitive values without options map
		content = String(value);
	}

	// Fix #5 Falsy Value: 0 is valid content
	const hasContent =
		content !== null && content !== undefined && content !== "";

	return (
		<span className={cn("block flex-1 truncate text-left", className)}>
			{hasContent
				? content
				: placeholder || <span className="text-transparent">Select</span>}
		</span>
	);
}

export function SelectContent({
	className,
	children,
	anchor = "bottom start",
}: {
	className?: string;
	children?: React.ReactNode;
	anchor?: "bottom start" | "bottom end" | "bottom" | "top start" | "top end";
}) {
	const { options } = useSelectContext<any>();

	// Fix #10 Empty Content
	const hasOptions = options && options.length > 0;
	const hasChildren = React.Children.count(children) > 0;

	if (!hasOptions && !hasChildren) return null;

	return (
		<ListboxOptions
			transition
			anchor={anchor}
			className={cn(
				"z-50 min-w-[8rem] overflow-hidden rounded-md bg-white p-1 shadow-lg outline-none ring-1 ring-black/5",
				"transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
				"origin-top [--anchor-gap:4px]",
				className,
			)}
		>
			{options
				? options.map((opt) => (
						<SelectItem
							key={String(opt.value)} // Fix #2 Key generation
							value={opt.value}
							disabled={opt.disabled}
						>
							{opt.label}
						</SelectItem>
					))
				: children}
		</ListboxOptions>
	);
}

export function SelectItem({
	value,
	children,
	className,
	disabled,
}: {
	value: any;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
}) {
	return (
		<ListboxOption
			value={value}
			disabled={disabled}
			className={cn(
				"group relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none",
				"data-[focus]:bg-gray-100 data-[focus]:text-gray-900",
				"data-[selected]:bg-primary-50 data-[selected]:text-primary-900",
				"data-[disabled]:opacity-50",
				className,
			)}
		>
			{/* Fix #9 RTL would need 'right-2' but currently sticking to LTR standard. 
                For RTL support, we would use logical properties or 'rtl:right-2 rtl:left-auto'. 
                Assuming LTR for basic cleanup now. */}
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center opacity-0 transition-opacity group-data-[selected]:opacity-100">
				<Check className="h-4 w-4 text-primary-600" />
			</span>
			{/* Fix #12 Overflow: truncate is good, but maybe native title? */}
			<span
				className="block truncate font-normal group-data-[selected]:font-medium"
				title={typeof children === "string" ? children : undefined}
			>
				{children}
			</span>
		</ListboxOption>
	);
}
