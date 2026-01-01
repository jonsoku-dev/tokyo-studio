import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	containerClassName?: string;
	startIcon?: ReactNode;
}

export function Input({
	className,
	label,
	error,
	id,
	containerClassName,
	startIcon,
	...props
}: InputProps) {
	return (
		<div className={cn("w-full", containerClassName)}>
			{label && (
				<label htmlFor={id} className="label">
					{label}
				</label>
			)}
			<div className="relative">
				{startIcon && (
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						{startIcon}
					</div>
				)}
				<input
					id={id}
					className={cn(
						"input",
						startIcon && "pl-9",
						error && "input-error",
						className,
					)}
					{...props}
				/>
			</div>
			{error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
		</div>
	);
}
