/**
 * SPEC 006: Storage Usage Indicator Component
 *
 * Displays user's storage usage with visual progress bar
 * - Shows used storage vs total quota (100MB)
 * - Color-coded based on usage percentage
 * - Warning message when approaching limit
 */

import { useMemo } from "react";

export interface StorageUsageIndicatorProps {
	/** Current storage used in bytes */
	storageUsed: number;
	/** Total storage limit in bytes (default: 100MB) */
	storageLimit?: number;
	/** Show detailed breakdown */
	detailed?: boolean;
}

export function StorageUsageIndicator({
	storageUsed,
	storageLimit = 100 * 1024 * 1024, // 100MB default
	detailed = false,
}: StorageUsageIndicatorProps) {
	const { usagePercentage, usedMB, limitMB, remainingMB, color } =
		useMemo(() => {
			const percentage = Math.min((storageUsed / storageLimit) * 100, 100);
			const usedMB = (storageUsed / (1024 * 1024)).toFixed(1);
			const limitMB = (storageLimit / (1024 * 1024)).toFixed(0);
			const remainingMB = Math.max(
				(storageLimit - storageUsed) / (1024 * 1024),
				0,
			).toFixed(1);

			// Determine color based on usage
			let color = "bg-primary-500";
			if (percentage >= 90) {
				color = "bg-red-500";
			} else if (percentage >= 75) {
				color = "bg-yellow-500";
			}

			return {
				usagePercentage: percentage,
				usedMB,
				limitMB,
				remainingMB,
				color,
			};
		}, [storageUsed, storageLimit]);

	return (
		<div className="rounded-lg bg-gray-50 p-4">
			<div className="mb-2 flex items-center justify-between">
				<span className="font-medium text-gray-700 text-sm">Storage Used</span>
				<span className="body-sm">
					{usedMB} / {limitMB} MB
				</span>
			</div>

			{/* Progress Bar */}
			<div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
				<div
					className={`h-full transition-all duration-300 ${color}`}
					style={{ width: `${usagePercentage}%` }}
				/>
			</div>

			{/* Warning Messages */}
			{usagePercentage >= 100 && (
				<p className="text-red-600 text-sm">
					⚠️ Storage limit reached. Delete some files to upload more.
				</p>
			)}
			{usagePercentage >= 90 && usagePercentage < 100 && (
				<p className="text-sm text-yellow-600">
					⚠️ You're running low on storage space ({remainingMB} MB remaining)
				</p>
			)}

			{/* Detailed Breakdown */}
			{detailed && (
				<div className="stack-xs divider mt-3 pt-3 text-gray-600 text-xs">
					<div className="flex justify-between">
						<span>Used:</span>
						<span className="font-medium">{usedMB} MB</span>
					</div>
					<div className="flex justify-between">
						<span>Remaining:</span>
						<span className="font-medium">{remainingMB} MB</span>
					</div>
					<div className="flex justify-between">
						<span>Usage:</span>
						<span className="font-medium">{usagePercentage.toFixed(1)}%</span>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Compact version for small spaces (e.g., navigation bar)
 */
export function StorageUsageCompact({
	storageUsed,
	storageLimit = 100 * 1024 * 1024,
}: Omit<StorageUsageIndicatorProps, "detailed">) {
	const { usagePercentage, usedMB, limitMB, color } = useMemo(() => {
		const percentage = Math.min((storageUsed / storageLimit) * 100, 100);
		const usedMB = (storageUsed / (1024 * 1024)).toFixed(0);
		const limitMB = (storageLimit / (1024 * 1024)).toFixed(0);

		let color = "bg-primary-500";
		if (percentage >= 90) {
			color = "bg-red-500";
		} else if (percentage >= 75) {
			color = "bg-yellow-500";
		}

		return { usagePercentage: percentage, usedMB, limitMB, color };
	}, [storageUsed, storageLimit]);

	return (
		<div className="inline-flex items-center gap-2">
			<div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
				<div
					className={`h-full transition-all duration-300 ${color}`}
					style={{ width: `${usagePercentage}%` }}
				/>
			</div>
			<span className="text-gray-600 text-xs">
				{usedMB}/{limitMB} MB
			</span>
		</div>
	);
}

/**
 * Helper function to format file size
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
