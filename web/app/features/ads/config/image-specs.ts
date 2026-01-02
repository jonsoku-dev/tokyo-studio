/**
 * Ad Image Specifications
 *
 * Source of Truth: web/app/features/ads/docs/ad-image-specs.md
 *
 * These constants define the accepted image dimensions and constraints
 * for house advertisements. Admin panel should validate uploads against
 * these specifications.
 */

/**
 * Image specification for a placement type
 */
export interface AdImageSpec {
	/** Recommended image width in pixels */
	readonly width: number;
	/** Recommended image height in pixels */
	readonly height: number;
	/** Maximum file size in bytes */
	readonly maxSize: number;
	/** Aspect ratio (width / height) */
	readonly aspectRatio: number;
	/** CSS max-height when displayed */
	readonly displayMaxHeight: number;
}

/**
 * All ad image specifications by placement type
 */
export const AD_IMAGE_SPECS = {
	"feed-top": {
		width: 1280,
		height: 720,
		maxSize: 500 * 1024, // 500KB
		aspectRatio: 16 / 9,
		displayMaxHeight: 280,
	},
	"feed-middle": {
		width: 1280,
		height: 720,
		maxSize: 500 * 1024,
		aspectRatio: 16 / 9,
		displayMaxHeight: 280,
	},
	"feed-bottom": {
		width: 1280,
		height: 720,
		maxSize: 500 * 1024,
		aspectRatio: 16 / 9,
		displayMaxHeight: 280,
	},
	sidebar: {
		width: 500,
		height: 500,
		maxSize: 300 * 1024, // 300KB
		aspectRatio: 1 / 1,
		displayMaxHeight: 500,
	},
	inline: {
		width: 800,
		height: 450,
		maxSize: 300 * 1024,
		aspectRatio: 16 / 9,
		displayMaxHeight: 160,
	},
	square: {
		width: 600,
		height: 600,
		maxSize: 300 * 1024,
		aspectRatio: 1 / 1,
		displayMaxHeight: 600,
	},
} as const satisfies Record<string, AdImageSpec>;

/**
 * Placement types that support images
 */
export type AdPlacementWithImage = keyof typeof AD_IMAGE_SPECS;

/**
 * Accepted image formats
 */
export const AD_IMAGE_FORMATS = [
	"image/png",
	"image/jpeg",
	"image/webp",
] as const;

export type AdImageFormat = (typeof AD_IMAGE_FORMATS)[number];

/**
 * Validation result for ad image upload
 */
export interface AdImageValidationResult {
	valid: boolean;
	error?: string;
	warnings?: string[];
}

/**
 * Validates an ad image file against specifications
 *
 * @param placement - The ad placement type
 * @param file - The image file to validate
 * @returns Validation result with errors/warnings
 *
 * @example
 * ```typescript
 * const result = validateAdImage('feed-middle', imageFile);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateAdImageFile(
	placement: AdPlacementWithImage,
	file: File,
): AdImageValidationResult {
	const spec = AD_IMAGE_SPECS[placement];

	// Validate file type
	if (!AD_IMAGE_FORMATS.includes(file.type as AdImageFormat)) {
		return {
			valid: false,
			error: `Invalid file format. Accepted: PNG, JPG, WebP`,
		};
	}

	// Validate file size
	if (file.size > spec.maxSize) {
		return {
			valid: false,
			error: `File too large. Maximum ${spec.maxSize / 1024}KB allowed`,
		};
	}

	return { valid: true };
}

/**
 * Validates image dimensions (requires loaded image)
 *
 * @param placement - The ad placement type
 * @param width - Actual image width
 * @param height - Actual image height
 * @returns Validation result with errors/warnings
 */
export function validateAdImageDimensions(
	placement: AdPlacementWithImage,
	width: number,
	height: number,
): AdImageValidationResult {
	const spec = AD_IMAGE_SPECS[placement];
	const warnings: string[] = [];

	// Check minimum dimensions
	if (width < spec.width || height < spec.height) {
		return {
			valid: false,
			error: `Image too small. Minimum ${spec.width}×${spec.height}px required`,
		};
	}

	// Warn if dimensions are too large (but still valid)
	const maxWidth = spec.width * 2;
	const maxHeight = spec.height * 2;
	if (width > maxWidth || height > maxHeight) {
		warnings.push(
			`Image larger than recommended. Consider resizing to ${spec.width}×${spec.height}px`,
		);
	}

	// Check aspect ratio (allow 5% tolerance)
	const actualRatio = width / height;
	const tolerance = 0.05;
	const minRatio = spec.aspectRatio * (1 - tolerance);
	const maxRatio = spec.aspectRatio * (1 + tolerance);

	if (actualRatio < minRatio || actualRatio > maxRatio) {
		const expectedRatio =
			spec.aspectRatio === 16 / 9
				? "16:9"
				: spec.aspectRatio === 4 / 5
					? "4:5"
					: "1:1";
		warnings.push(`Aspect ratio mismatch. Expected ${expectedRatio}`);
	}

	return {
		valid: true,
		warnings: warnings.length > 0 ? warnings : undefined,
	};
}

/**
 * Gets the recommended dimensions for a placement as a formatted string
 *
 * @param placement - The ad placement type
 * @returns Formatted dimension string (e.g., "1280×720")
 */
export function getRecommendedDimensions(
	placement: AdPlacementWithImage,
): string {
	const spec = AD_IMAGE_SPECS[placement];
	return `${spec.width}×${spec.height}`;
}

/**
 * Gets the aspect ratio for a placement as a formatted string
 *
 * @param placement - The ad placement type
 * @returns Formatted aspect ratio (e.g., "16:9")
 */
export function getAspectRatioLabel(placement: AdPlacementWithImage): string {
	const spec = AD_IMAGE_SPECS[placement];
	if (spec.aspectRatio === 16 / 9) return "16:9";
	if (spec.aspectRatio === 4 / 5) return "4:5";
	if (spec.aspectRatio === 1) return "1:1";
	return spec.aspectRatio.toFixed(2);
}
