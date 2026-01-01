import type { ReactNode } from "react";
import { cn } from "~/shared/utils/cn";

interface PageHeaderProps {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	actions,
	children,
	className,
}: PageHeaderProps) {
	return (
		<div className={cn("border-gray-200 border-b pb-6", className)}>
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
				<div className="min-w-0 flex-1">
					<h1 className="heading-3 text-gray-900 truncate">{title}</h1>
					{description && (
						<div className="body-md mt-1 text-gray-500">{description}</div>
					)}
				</div>

				{actions && (
					<div className="flex shrink-0 items-center gap-3">{actions}</div>
				)}
			</div>

			{children && <div className="mt-4">{children}</div>}
		</div>
	);
}
