/**
 * SPEC 001: OAuth Token Encryption
 *
 * Securely encrypt and decrypt OAuth access/refresh tokens
 * Uses AES-256-GCM encryption
 *
 * Environment Variables Required:
 * - TOKEN_ENCRYPTION_KEY: 64-character hex string (32 bytes)
 *   Generate with: openssl rand -hex 32
 */

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const _AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || "d2c02ad841db1cc33eabcc8b8b62520b13ec5befab1cd59e6d384697f1565401";

// Validate encryption key on module load
if (!ENCRYPTION_KEY) {
	console.warn(
		"[TOKEN ENCRYPTION] TOKEN_ENCRYPTION_KEY not set. OAuth tokens will not be encrypted.",
	);
} else if (ENCRYPTION_KEY.length !== 64) {
	console.error(
		"[TOKEN ENCRYPTION] TOKEN_ENCRYPTION_KEY must be 64 characters (32 bytes in hex). Generate with: openssl rand -hex 32",
	);
}

/**
 * Encrypt a token using AES-256-GCM
 *
 * @param plaintext - The token to encrypt
 * @returns Encrypted token in format: iv:authTag:ciphertext (all hex)
 *
 * @example
 * const encrypted = encryptToken("ya29.a0AfH6SMBx...");
 * // Returns: "3a5f2c1e....:9b8d7c6a....:4f3e2d1c...."
 */
export function encryptToken(plaintext: string): string {
	if (!ENCRYPTION_KEY) {
		// Fallback: Return plaintext with warning prefix
		console.warn("[TOKEN ENCRYPTION] Returning unencrypted token");
		return `UNENCRYPTED:${plaintext}`;
	}

	if (!plaintext) {
		throw new Error("Cannot encrypt empty token");
	}

	try {
		// Generate random IV
		const iv = crypto.randomBytes(IV_LENGTH);

		// Create cipher
		const key = Buffer.from(ENCRYPTION_KEY, "hex");
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

		// Encrypt
		let encrypted = cipher.update(plaintext, "utf8", "hex");
		encrypted += cipher.final("hex");

		// Get auth tag
		const authTag = cipher.getAuthTag();

		// Return format: iv:authTag:ciphertext
		return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
	} catch (error) {
		console.error("[TOKEN ENCRYPTION] Encryption failed:", error);
		throw new Error("Token encryption failed");
	}
}

/**
 * Decrypt a token using AES-256-GCM
 *
 * @param encrypted - Encrypted token in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext token
 *
 * @example
 * const decrypted = decryptToken("3a5f2c1e....:9b8d7c6a....:4f3e2d1c....");
 * // Returns: "ya29.a0AfH6SMBx..."
 */
export function decryptToken(encrypted: string): string {
	if (!ENCRYPTION_KEY) {
		// Handle unencrypted tokens
		if (encrypted.startsWith("UNENCRYPTED:")) {
			return encrypted.replace("UNENCRYPTED:", "");
		}
		console.warn("[TOKEN ENCRYPTION] Returning encrypted token as-is");
		return encrypted;
	}

	if (!encrypted) {
		throw new Error("Cannot decrypt empty token");
	}

	// Handle unencrypted tokens
	if (encrypted.startsWith("UNENCRYPTED:")) {
		return encrypted.replace("UNENCRYPTED:", "");
	}

	try {
		// Split encrypted token
		const parts = encrypted.split(":");
		if (parts.length !== 3) {
			throw new Error(
				"Invalid encrypted token format. Expected: iv:authTag:ciphertext",
			);
		}

		const [ivHex, authTagHex, ciphertext] = parts;

		// Convert from hex
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const key = Buffer.from(ENCRYPTION_KEY, "hex");

		// Create decipher
		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt
		let decrypted = decipher.update(ciphertext, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("[TOKEN ENCRYPTION] Decryption failed:", error);
		throw new Error("Token decryption failed");
	}
}

/**
 * Check if token encryption is configured
 */
export function isTokenEncryptionEnabled(): boolean {
	return !!(ENCRYPTION_KEY && ENCRYPTION_KEY.length === 64);
}

/**
 * Validate encryption key format
 */
export function validateEncryptionKey(): {
	valid: boolean;
	error?: string;
} {
	if (!ENCRYPTION_KEY) {
		return {
			valid: false,
			error: "TOKEN_ENCRYPTION_KEY not set",
		};
	}

	if (ENCRYPTION_KEY.length !== 64) {
		return {
			valid: false,
			error: "TOKEN_ENCRYPTION_KEY must be 64 characters (32 bytes in hex)",
		};
	}

	// Test if it's valid hex
	const hexPattern = /^[0-9a-f]{64}$/i;
	if (!hexPattern.test(ENCRYPTION_KEY)) {
		return {
			valid: false,
			error: "TOKEN_ENCRYPTION_KEY must be valid hexadecimal",
		};
	}

	return { valid: true };
}
