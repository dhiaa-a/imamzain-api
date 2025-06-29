// src/utils/slug.utils.ts

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
	let slug = baseSlug
	let counter = 1

	while (existingSlugs.includes(slug)) {
		slug = `${baseSlug}-${counter}`
		counter++
	}

	return slug
}

/**
 * Validate if a slug follows the correct format
 */
export function isValidSlug(slug: string): boolean {
	// Slug should only contain lowercase letters, numbers, and hyphens
	// Should not start or end with a hyphen
	const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
	return slugRegex.test(slug)
}