"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "~/shared/utils/cn";

// Simplified Select Implementation for compatibility
// We will implement a simplified version using standard React state

const SelectContext = React.createContext<{
	value: string;
	onValueChange: (value: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
} | null>(null);

export interface SelectProps {
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children?: React.ReactNode;
}

export function Select({ defaultValue, onValueChange, children }: SelectProps) {
	const [value, setValue] = React.useState(defaultValue || "");
	const [open, setOpen] = React.useState(false);

	const handleValueChange = (newValue: string) => {
		setValue(newValue);
		onValueChange?.(newValue);
		setOpen(false);
	};

	return (
		<SelectContext.Provider
			value={{ value, onValueChange: handleValueChange, open, setOpen }}
		>
			<div className="relative inline-block w-full text-left">{children}</div>
		</SelectContext.Provider>
	);
}

export function SelectTrigger({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const context = React.useContext(SelectContext);
	if (!context) throw new Error("SelectTrigger must be used within Select");

	return (
		<button
			type="button"
			onClick={() => context.setOpen(!context.open)}
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
		>
			{children}
			<ChevronDown className="h-4 w-4 opacity-50" />
		</button>
	);
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
	const context = React.useContext(SelectContext);
	// We need to map value to label if possible, but for now just show value or placeholder
	// This is a limitation of this simple mock. Ideally we look up the label.
	// BUT MentorDirectory uses simple values.

	// To show label, we'd need to register options.
	// For MVP, let's just show standard "selected" text if we can't look it up easily.
	// Or assume children of SelectItem contain the text.

	return (
		<span className="block truncate">{context?.value || placeholder}</span>
	);
}

export function SelectContent({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const context = React.useContext(SelectContext);
	if (!context || !context.open) return null;

	return (
		<div
			className={cn(
				"fade-in-80 absolute z-50 min-w-[8rem] animate-in overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
				className,
			)}
		>
			<div className="p-1">{children}</div>
		</div>
	);
}

export function SelectItem({
	value,
	children,
	className,
}: {
	value: string;
	children: React.ReactNode;
	className?: string;
}) {
	const context = React.useContext(SelectContext);
	if (!context) throw new Error("SelectItem must be used within Select");

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: Simplified implementation
		// biome-ignore lint/a11y/noStaticElementInteractions: Simplified implementation
		<div
			onClick={() => context.onValueChange(value)}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				{context.value === value && <Check className="h-4 w-4" />}
			</span>
			{children}
		</div>
	);
}
