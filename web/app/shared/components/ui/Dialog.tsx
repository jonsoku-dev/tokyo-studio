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
					<div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
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
		<DialogPanel
			className={cn(
				"w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all",
				className,
			)}
		>
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
		<HeadlessDialogTitle
			as="h3"
			className={cn("text-lg font-medium leading-6 text-gray-900", className)}
		>
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
	return (
		<div className={cn("text-sm text-gray-500", className)}>{children}</div>
	);
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
				"mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
		>
			{children}
		</div>
	);
}
