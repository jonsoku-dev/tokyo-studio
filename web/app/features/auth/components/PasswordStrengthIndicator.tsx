/**
 * SPEC 003: Real-time Password Strength Feedback (FR-006)
 *
 * Displays real-time password strength feedback as user types
 * with visual strength indicator and requirements checklist
 */

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
	calculatePasswordStrength,
	type PasswordStrengthResult,
} from "~/shared/utils/password-strength";

interface PasswordStrengthIndicatorProps {
	password: string;
	showRequirements?: boolean;
}

const strengthColors = {
	weak: "bg-red-500",
	fair: "bg-yellow-500",
	good: "bg-primary-500",
	strong: "bg-accent-500",
};

const strengthTextColors = {
	weak: "text-red-600",
	fair: "text-yellow-600",
	good: "text-primary-600",
	strong: "text-accent-600",
};

export function PasswordStrengthIndicator({
	password,
	showRequirements = true,
}: PasswordStrengthIndicatorProps) {
	const [result, setResult] = useState<PasswordStrengthResult | null>(null);

	useEffect(() => {
		if (password.length > 0) {
			setResult(calculatePasswordStrength(password));
		} else {
			setResult(null);
		}
	}, [password]);

	if (!result) {
		return null;
	}

	const { strength, meets, feedback } = result;
	const strengthWidth = `${(result.score / 5) * 100}%`;

	return (
		<div className="stack-sm mt-2">
			{/* Strength Bar */}
			<div className="stack-xs">
				<div className="h-2 overflow-hidden rounded-full bg-gray-200">
					<div
						className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
						style={{ width: strengthWidth }}
					/>
				</div>
				<p
					className={`font-medium text-xs ${strengthTextColors[strength]} capitalize`}
				>
					Strength: {strength}
				</p>
			</div>

			{/* Requirements Checklist */}
			{showRequirements && (
				<div className="stack-xs">
					<RequirementItem met={meets.minLength} text="At least 8 characters" />
					<RequirementItem
						met={meets.hasUppercase}
						text="One uppercase letter (A-Z)"
					/>
					<RequirementItem
						met={meets.hasLowercase}
						text="One lowercase letter (a-z)"
					/>
					<RequirementItem met={meets.hasNumber} text="One number (0-9)" />
				</div>
			)}

			{/* Feedback Messages */}
			{feedback.length > 0 && (
				<div className="stack-xs">
					{feedback.map((message, index) => (
						<p
							key={`${message}-${
								// biome-ignore lint/suspicious/noArrayIndexKey: messages are static unique strings list
								index
							}`}
							className="flex items-center gap-1 text-red-600 text-xs"
						>
							<X className="h-3 w-3" />
							{message}
						</p>
					))}
				</div>
			)}
		</div>
	);
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
	return (
		<div className="flex items-center gap-2 text-xs">
			{met ? (
				<Check className="h-4 w-4 flex-shrink-0 text-accent-600" />
			) : (
				<div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-300" />
			)}
			<span className={met ? "text-accent-600" : "text-gray-500"}>{text}</span>
		</div>
	);
}
