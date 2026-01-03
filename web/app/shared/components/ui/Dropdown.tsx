import {
	Menu,
	MenuButton,
	type MenuButtonProps,
	MenuItem,
	MenuItems,
	type MenuItemsProps,
} from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "~/shared/utils/cn";

export const Dropdown = Menu;

interface DropdownTriggerProps extends MenuButtonProps {
	className?: string;
	children: ReactNode;
}

export function DropdownTrigger({
	className,
	children,
	...props
}: DropdownTriggerProps) {
	return (
		<MenuButton as={Fragment} {...props}>
			<button type="button" className={cn("focus:outline-none", className)}>
				{children}
			</button>
		</MenuButton>
	);
}

export function DropdownButton({
	className,
	children,
	...props
}: MenuButtonProps) {
	return (
		<MenuButton
			className={cn(
				"flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50 focus:outline-none data-[open]:bg-gray-100",
				className,
			)}
			{...props}
		>
			{children}
		</MenuButton>
	);
}

export function DropdownCustomTrigger({
	className,
	children,
	...props
}: MenuButtonProps) {
	return (
		<MenuButton className={cn("focus:outline-none", className)} {...props}>
			{children}
		</MenuButton>
	);
}

export function DropdownContent({
	className,
	children,
	anchor = "bottom start",
	...props
}: MenuItemsProps) {
	return (
		<MenuItems
			transition
			anchor={anchor}
			className={cn(
				"z-50 min-w-[12rem] overflow-hidden rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5",
				"transition duration-100 ease-out [--anchor-gap:8px]",
				"data-[closed]:scale-95 data-[closed]:opacity-0",
				className,
			)}
			{...props}
		>
			{children}
		</MenuItems>
	);
}

// Separate onClick from MenuItemProps to handle it on the inner button
interface DropdownItemProps {
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	onClick?: () => void;
}

export function DropdownItem({
	className,
	children,
	disabled,
	onClick,
}: DropdownItemProps) {
	return (
		<MenuItem disabled={disabled}>
			{({ focus }) => (
				<button
					type="button"
					onClick={onClick}
					disabled={disabled}
					className={cn(
						"group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
						focus ? "bg-gray-100 text-gray-900" : "text-gray-700",
						disabled && "cursor-not-allowed opacity-50",
						className,
					)}
				>
					{children}
				</button>
			)}
		</MenuItem>
	);
}

interface DropdownLinkProps extends Omit<LinkProps, "children"> {
	children: ReactNode;
	className?: string;
}

export function DropdownLink({
	className,
	children,
	...props
}: DropdownLinkProps) {
	return (
		<MenuItem>
			{({ focus }) => (
				<Link
					className={cn(
						"flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
						focus ? "bg-primary-50 text-primary-900" : "text-gray-700",
						className,
					)}
					{...props}
				>
					{children}
				</Link>
			)}
		</MenuItem>
	);
}

export const DropdownSeparator = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("-mx-1 my-1 h-px bg-gray-100", className)} {...props} />
);

export const DropdownLabel = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("px-2 py-1.5 font-semibold text-gray-500 text-xs", className)}
		{...props}
	/>
);
