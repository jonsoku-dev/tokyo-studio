import type { InputHTMLAttributes } from "react";
import { cn } from "~/shared/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
	return (
		<div className="w-full">
			{label && (
				<label htmlFor={id} className="label">
					{label}
				</label>
			)}
			<input
				id={id}
				className={cn("input", error && "input-error", className)}
				{...props}
			/>
			{error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
		</div>
	);
}
