// SPEC 003: Password Reset - Password Strength Calculator

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
	score: number;
	strength: PasswordStrength;
	feedback: string[];
	meets: {
		minLength: boolean;
		hasUppercase: boolean;
		hasLowercase: boolean;
		hasNumber: boolean;
		hasSpecialChar: boolean;
	};
}

const COMMON_PASSWORDS = [
	"password",
	"password123",
	"12345678",
	"qwerty",
	"abc123",
	"admin",
	"welcome",
];

const KEYBOARD_PATTERNS = ["qwerty", "asdfgh", "zxcvbn"];

export function calculatePasswordStrength(
	password: string,
): PasswordStrengthResult {
	const meets = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
	};

	let score = 0;
	if (meets.minLength) score++;
	if (meets.hasUppercase) score++;
	if (meets.hasLowercase) score++;
	if (meets.hasNumber) score++;
	if (meets.hasSpecialChar) score++;

	const feedback: string[] = [];
	if (!meets.minLength) feedback.push("At least 8 characters required");
	if (!meets.hasUppercase) feedback.push("Add an uppercase letter");
	if (!meets.hasLowercase) feedback.push("Add a lowercase letter");
	if (!meets.hasNumber) feedback.push("Add a number");

	const lowerPassword = password.toLowerCase();
	if (COMMON_PASSWORDS.some((common) => lowerPassword.includes(common))) {
		feedback.push("Password is too common");
		score = Math.max(0, score - 2);
	}

	if (KEYBOARD_PATTERNS.some((pattern) => lowerPassword.includes(pattern))) {
		feedback.push("Avoid keyboard patterns");
		score = Math.max(0, score - 1);
	}

	let strength: PasswordStrength;
	if (score <= 2) strength = "weak";
	else if (score === 3) strength = "fair";
	else if (score === 4) strength = "good";
	else strength = "strong";

	return { score, strength, feedback, meets };
}
