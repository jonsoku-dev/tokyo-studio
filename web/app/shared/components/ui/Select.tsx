"use client";

import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "~/shared/utils/cn";

export interface SelectProps<T> {
	value?: T;
	defaultValue?: T;
	onValueChange?: (value: T) => void;
	disabled?: boolean;
	name?: string;
	children?: React.ReactNode;
}

export function Select<T>({
	value,
	defaultValue,
	onValueChange,
	disabled,
	name,
	children,
}: SelectProps<T>) {
	return (
		<Listbox
			value={value}
			defaultValue={defaultValue}
			onChange={onValueChange}
			disabled={disabled}
			name={name}
		>
			<div className="relative inline-block w-full">{children}</div>
		</Listbox>
	);
}

export function SelectTrigger({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<ListboxButton
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				"data-[open]:border-primary-500 data-[open]:ring-2 data-[open]:ring-primary-100",
				className,
			)}
		>
			{children}
			<ChevronDown className="h-4 w-4 opacity-50" />
		</ListboxButton>
	);
}

export function SelectValue({
	placeholder,
	children,
}: {
	placeholder?: string;
	children?: React.ReactNode;
}) {
	return (
		<span className="block flex-1 truncate text-left">
			{children || placeholder}
		</span>
	);
}

export function SelectContent({
	className,
	children,
	anchor = "bottom start",
}: {
	className?: string;
	children: React.ReactNode;
	anchor?: "bottom start" | "bottom end" | "bottom" | "top start" | "top end";
}) {
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
			{children}
		</ListboxOptions>
	);
}

export function SelectItem({
	value,
	children,
	className,
}: {
	value: unknown;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<ListboxOption
			value={value}
			className={cn(
				"group relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none",
				"data-[focus]:bg-gray-100 data-[focus]:text-gray-900",
				"data-[selected]:bg-primary-50 data-[selected]:text-primary-900",
				className,
			)}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center opacity-0 transition-opacity group-data-[selected]:opacity-100">
				<Check className="h-4 w-4 text-primary-600" />
			</span>
			<span className="block truncate font-normal group-data-[selected]:font-medium">
				{children}
			</span>
		</ListboxOption>
	);
}
