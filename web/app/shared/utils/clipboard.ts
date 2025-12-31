/**
 * SPEC 020: Clipboard Utility (P2)
 *
 * Provides clipboard copy functionality with toast feedback.
 * 직관적 API: copyToClipboard(text) => boolean
 */

/**
 * Copies text to clipboard
 * Returns true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
			return true;
		}

		// Fallback for older browsers
		return fallbackCopy(text);
	} catch {
		return fallbackCopy(text);
	}
}

/**
 * Fallback copy using hidden input
 */
function fallbackCopy(text: string): boolean {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.left = "-999999px";
	textArea.style.top = "-999999px";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		document.execCommand("copy");
		document.body.removeChild(textArea);
		return true;
	} catch {
		document.body.removeChild(textArea);
		return false;
	}
}
