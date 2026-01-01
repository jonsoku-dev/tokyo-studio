import {
	DialogPanel,
	Dialog as HeadlessDialog,
	DialogTitle as HeadlessDialogTitle,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}

/**
 * Base Dialog component using HeadlessUI v2
 * Uses data-closed attribute for styling instead of Transition components
 * Supports composition with DialogContent, DialogHeader, DialogTitle, etc.
 */
export function Dialog({ open, onOpenChange, children }: DialogProps) {
	return (
		<HeadlessDialog
			open={open}
			onClose={() => onOpenChange(false)}
			className="relative z-50"
		>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 data-closed:opacity-0" />

			{/* Content area */}
			<div className="fixed inset-0 overflow-y-auto">
				<div className="flex min-h-full items-center justify-center p-4 text-center">
					{children}
				</div>
			</div>
		</HeadlessDialog>
	);
}

interface DialogContentProps {
	className?: string;
	children: ReactNode;
}

export function DialogContent({ className, children }: DialogContentProps) {
	return (
		<DialogPanel
			className={cn(
				"w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition duration-300 data-closed:scale-95 data-closed:opacity-0",
				className,
			)}
		>
			{children}
		</DialogPanel>
	);
}

interface DialogHeaderProps {
	className?: string;
	children: ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
	return (
		<div className={cn("mb-4 flex items-center justify-between", className)}>
			{children}
		</div>
	);
}

interface DialogTitleProps {
	className?: string;
	children: ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
	return (
		<HeadlessDialogTitle
			as="h3"
			className={cn("heading-5 leading-6", className)}
		>
			{children}
		</HeadlessDialogTitle>
	);
}

interface DialogDescriptionProps {
	className?: string;
	children: ReactNode;
}

export function DialogDescription({
	className,
	children,
}: DialogDescriptionProps) {
	return (
		<div className={cn("body-sm text-gray-600", className)}>{children}</div>
	);
}

interface DialogFooterProps {
	className?: string;
	children: ReactNode;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
	return (
		<div
			className={cn(
				"mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
		>
			{children}
		</div>
	);
}
