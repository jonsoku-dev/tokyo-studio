import {
	DialogPanel,
	Dialog as HeadlessDialog,
	DialogTitle as HeadlessDialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	return (
		<Transition appear show={open} as={Fragment}>
			<HeadlessDialog
				as="div"
				className="relative z-50"
				onClose={() => onOpenChange(false)}
			>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="dialog-overlay" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="center min-h-full p-4 text-center">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							{children}
						</TransitionChild>
					</div>
				</div>
			</HeadlessDialog>
		</Transition>
	);
}

export function DialogContent({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<DialogPanel className={cn("dialog-content", className)}>
			{children}
		</DialogPanel>
	);
}

export function DialogHeader({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<HeadlessDialogTitle as="h3" className={cn("dialog-title", className)}>
			{children}
		</HeadlessDialogTitle>
	);
}

export function DialogDescription({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return <div className={cn("dialog-description", className)}>{children}</div>;
}

export function DialogFooter({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2",
				className,
			)}
		>
			{children}
		</div>
	);
}
