/**
 * Unit Tests for Document Validation Layer
 * Comprehensive test coverage for all validation functions
 */

import { describe, expect, test } from "vitest";
import {
	createValidationErrorResponse,
	validateDocumentStatus,
	validateDocumentTitle,
	validateDocumentType,
	validateDocumentUpdate,
	validatePaginationParams,
	validateSearchQuery,
	validateUploadFile,
} from "./validation";

describe("validateDocumentTitle", () => {
	test("accepts valid titles", () => {
		const validTitles = [
			"My Resume (EN)",
			"Software Engineer CV 2024",
			"Portfolio_v2.0",
			"Cover-Letter-Google",
			"Resume: John Doe",
			"CV & Portfolio",
			"My Documents/Resume",
			"Test! Document?",
		];

		for (const title of validTitles) {
			const result = validateDocumentTitle(title);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
			expect(result.value).toBe(title.trim());
		}
	});

	test("rejects empty or whitespace-only titles", () => {
		const invalidTitles = ["", "   ", "\t", "\n", "  \t\n  "];

		for (const title of invalidTitles) {
			const result = validateDocumentTitle(title);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("empty");
		}
	});

	test("rejects titles exceeding 255 characters", () => {
		const longTitle = "a".repeat(256);
		const result = validateDocumentTitle(longTitle);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("255");
	});

	test("accepts title with exactly 255 characters", () => {
		const maxTitle = "a".repeat(255);
		const result = validateDocumentTitle(maxTitle);
		expect(result.valid).toBe(true);
	});

	test("rejects titles with null bytes", () => {
		const result = validateDocumentTitle("Test\0Document");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("null byte");
	});

	test("rejects titles with special characters (XSS attempts)", () => {
		const xssAttempts = [
			"<script>alert('xss')</script>",
			"Test<img src=x onerror=alert(1)>",
			"Test; DROP TABLE documents;",
			"Test\x00Document",
		];

		for (const xss of xssAttempts) {
			const result = validateDocumentTitle(xss);
			expect(result.valid).toBe(false);
		}
	});

	test("trims whitespace from title", () => {
		const result = validateDocumentTitle("  Test Document  ");
		expect(result.valid).toBe(true);
		expect(result.value).toBe("Test Document");
	});

	test("handles null/undefined input", () => {
		const result = validateDocumentTitle(null as unknown as string);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("required");
	});
});

describe("validateUploadFile", () => {
	// Helper to create mock File objects
	const createMockFile = (name: string, size: number, type: string): File => {
		const blob = new Blob(["a".repeat(size)], { type });
		return new File([blob], name, { type });
	};

	test("accepts valid PDF file", () => {
		const file = createMockFile("resume.pdf", 1024 * 100, "application/pdf"); // 100KB
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
		expect(result.value).toBe("resume.pdf");
	});

	test("accepts valid DOCX file", () => {
		const file = createMockFile(
			"resume.docx",
			1024 * 100,
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		);
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});

	test("accepts valid DOC file", () => {
		const file = createMockFile("resume.doc", 1024 * 100, "application/msword");
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});

	test("accepts valid DOCM file", () => {
		const file = createMockFile(
			"resume.docm",
			1024 * 100,
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document-macro",
		);
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});

	test("rejects file smaller than 1KB", () => {
		const file = createMockFile("resume.pdf", 500, "application/pdf");
		const result = validateUploadFile(file);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("too small");
		expect(result.error).toContain("1KB");
	});

	test("accepts file exactly 1KB", () => {
		const file = createMockFile("resume.pdf", 1024, "application/pdf");
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});

	test("rejects file larger than 50MB", () => {
		const file = createMockFile(
			"resume.pdf",
			51 * 1024 * 1024,
			"application/pdf",
		);
		const result = validateUploadFile(file);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("too large");
		expect(result.error).toContain("50MB");
	});

	test("accepts file exactly 50MB", () => {
		const file = createMockFile(
			"resume.pdf",
			50 * 1024 * 1024,
			"application/pdf",
		);
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});

	test("rejects invalid MIME types", () => {
		const invalidTypes = [
			{ name: "resume.txt", type: "text/plain" },
			{ name: "resume.jpg", type: "image/jpeg" },
			{ name: "resume.zip", type: "application/zip" },
			{ name: "resume.exe", type: "application/x-msdownload" },
		];

		for (const { name, type } of invalidTypes) {
			const file = createMockFile(name, 1024 * 10, type);
			const result = validateUploadFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Invalid file type");
		}
	});

	test("rejects extension mismatch", () => {
		// PDF MIME type but DOCX extension
		const file = createMockFile("resume.docx", 1024 * 10, "application/pdf");
		const result = validateUploadFile(file);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("extension does not match");
	});

	test("handles null/undefined file", () => {
		const result = validateUploadFile(null as unknown as File);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("required");
	});

	test("handles case-insensitive extensions", () => {
		const file = createMockFile("resume.PDF", 1024 * 10, "application/pdf");
		const result = validateUploadFile(file);
		expect(result.valid).toBe(true);
	});
});

describe("validateDocumentType", () => {
	test("accepts all valid document types", () => {
		const validTypes = ["Resume", "CV", "Portfolio", "Cover Letter", "Other"];

		for (const type of validTypes) {
			const result = validateDocumentType(type);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(type);
		}
	});

	test("rejects invalid document types", () => {
		const invalidTypes = [
			"resume", // lowercase
			"cv", // lowercase
			"Document",
			"Letter",
			"File",
			"Unknown",
		];

		for (const type of invalidTypes) {
			const result = validateDocumentType(type);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Invalid document type");
		}
	});

	test("rejects empty or whitespace-only types", () => {
		const invalidTypes = ["", "   ", "\t"];

		for (const type of invalidTypes) {
			const result = validateDocumentType(type);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("required");
		}
	});

	test("trims whitespace from type", () => {
		const result = validateDocumentType("  Resume  ");
		expect(result.valid).toBe(true);
		expect(result.value).toBe("Resume");
	});

	test("handles null/undefined input", () => {
		const result = validateDocumentType(null as unknown as string);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("required");
	});
});

describe("validateDocumentStatus", () => {
	test("accepts valid statuses", () => {
		const validStatuses = ["draft", "final"];

		for (const status of validStatuses) {
			const result = validateDocumentStatus(status);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(status);
		}
	});

	test("accepts case-insensitive statuses", () => {
		const variations = ["DRAFT", "Draft", "FINAL", "Final"];

		for (const status of variations) {
			const result = validateDocumentStatus(status);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(status.toLowerCase());
		}
	});

	test("rejects invalid statuses", () => {
		const invalidStatuses = ["pending", "published", "archived", "deleted"];

		for (const status of invalidStatuses) {
			const result = validateDocumentStatus(status);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Invalid document status");
		}
	});

	test("rejects empty or whitespace-only statuses", () => {
		const invalidStatuses = ["", "   ", "\t"];

		for (const status of invalidStatuses) {
			const result = validateDocumentStatus(status);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("required");
		}
	});

	test("trims whitespace from status", () => {
		const result = validateDocumentStatus("  draft  ");
		expect(result.valid).toBe(true);
		expect(result.value).toBe("draft");
	});
});

describe("validateSearchQuery", () => {
	test("accepts valid search queries", () => {
		const validQueries = [
			"resume",
			"my document",
			"software engineer",
			"2024",
			"resume.pdf",
		];

		for (const query of validQueries) {
			const result = validateSearchQuery(query);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(query.trim());
		}
	});

	test("accepts empty query", () => {
		const result = validateSearchQuery("");
		expect(result.valid).toBe(true);
		expect(result.value).toBe("");
	});

	test("rejects queries exceeding 100 characters", () => {
		const longQuery = "a".repeat(101);
		const result = validateSearchQuery(longQuery);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("100 characters");
	});

	test("accepts query with exactly 100 characters", () => {
		const maxQuery = "a".repeat(100);
		const result = validateSearchQuery(maxQuery);
		expect(result.valid).toBe(true);
	});

	test("rejects queries with null bytes", () => {
		const result = validateSearchQuery("test\0query");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("null byte");
	});

	test("rejects SQL injection attempts", () => {
		const sqlInjections = [
			"'; DROP TABLE documents; --",
			"SELECT * FROM documents",
			"UNION SELECT password FROM users",
			"1' OR '1'='1",
			"admin'--",
			"1; DELETE FROM documents",
			"/* comment */ SELECT",
			"xp_cmdshell",
		];

		for (const injection of sqlInjections) {
			const result = validateSearchQuery(injection);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("unsafe");
		}
	});

	test("trims whitespace from query", () => {
		const result = validateSearchQuery("  test query  ");
		expect(result.valid).toBe(true);
		expect(result.value).toBe("test query");
	});
});

describe("validatePaginationParams", () => {
	test("accepts valid pagination parameters", () => {
		const validParams = [
			{ page: 1, pageSize: 10 },
			{ page: 5, pageSize: 25 },
			{ page: 100, pageSize: 100 },
			{ page: 1, pageSize: 1 },
		];

		for (const { page, pageSize } of validParams) {
			const result = validatePaginationParams(page, pageSize);
			expect(result.valid).toBe(true);
			expect(result.value).toBe(page);
		}
	});

	test("rejects page less than 1", () => {
		const result = validatePaginationParams(0, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("positive integer");
	});

	test("rejects negative page", () => {
		const result = validatePaginationParams(-1, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("positive integer");
	});

	test("rejects non-integer page", () => {
		const result = validatePaginationParams(1.5, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("positive integer");
	});

	test("rejects pageSize less than 1", () => {
		const result = validatePaginationParams(1, 0);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("between 1 and 100");
	});

	test("rejects pageSize greater than 100", () => {
		const result = validatePaginationParams(1, 101);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("between 1 and 100");
	});

	test("rejects non-integer pageSize", () => {
		const result = validatePaginationParams(1, 10.5);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("integer");
	});

	test("accepts boundary values", () => {
		// Minimum values
		let result = validatePaginationParams(1, 1);
		expect(result.valid).toBe(true);

		// Maximum pageSize
		result = validatePaginationParams(1, 100);
		expect(result.valid).toBe(true);
	});
});

describe("createValidationErrorResponse", () => {
	test("creates standardized error response", () => {
		const response = createValidationErrorResponse(
			"title",
			"Title is required",
		);
		expect(response).toEqual({
			error: "Title is required",
			field: "title",
			code: "VALIDATION_ERROR",
		});
	});
});

describe("validateDocumentUpdate", () => {
	test("validates all fields when provided", () => {
		const data = {
			title: "My Resume",
			status: "draft",
			type: "Resume",
		};

		const errors = validateDocumentUpdate(data);
		expect(errors).toHaveLength(0);
	});

	test("returns errors for invalid fields", () => {
		const data = {
			title: "", // Invalid
			status: "invalid", // Invalid
			type: "invalid", // Invalid
		};

		const errors = validateDocumentUpdate(data);
		expect(errors).toHaveLength(3);
		expect(errors.map((e) => e.field)).toContain("title");
		expect(errors.map((e) => e.field)).toContain("status");
		expect(errors.map((e) => e.field)).toContain("type");
	});

	test("validates only provided fields", () => {
		const data = {
			title: "My Resume",
			// status and type not provided
		};

		const errors = validateDocumentUpdate(data);
		expect(errors).toHaveLength(0);
	});

	test("returns multiple errors for multiple invalid fields", () => {
		const data = {
			title: "a".repeat(256), // Too long
			status: "pending", // Invalid
		};

		const errors = validateDocumentUpdate(data);
		expect(errors).toHaveLength(2);
		expect(errors.find((e) => e.field === "title")).toBeDefined();
		expect(errors.find((e) => e.field === "status")).toBeDefined();
	});

	test("handles empty object", () => {
		const errors = validateDocumentUpdate({});
		expect(errors).toHaveLength(0);
	});
});
