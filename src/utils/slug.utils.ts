// src/utils/slug.utils.ts

<<<<<<< HEAD
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace Arabic/Persian/Urdu characters with transliteration or remove
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

export function isValidSlug(slug: string): boolean {
  // Slug should contain only lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  // Should not contain consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
=======
/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Arabic/Persian characters with transliteration
    .replace(/[ا]/g, 'a')
    .replace(/[ب]/g, 'b')
    .replace(/[ت]/g, 't')
    .replace(/[ث]/g, 'th')
    .replace(/[ج]/g, 'j')
    .replace(/[ح]/g, 'h')
    .replace(/[خ]/g, 'kh')
    .replace(/[د]/g, 'd')
    .replace(/[ذ]/g, 'dh')
    .replace(/[ر]/g, 'r')
    .replace(/[ز]/g, 'z')
    .replace(/[س]/g, 's')
    .replace(/[ش]/g, 'sh')
    .replace(/[ص]/g, 's')
    .replace(/[ض]/g, 'd')
    .replace(/[ط]/g, 't')
    .replace(/[ظ]/g, 'z')
    .replace(/[ع]/g, 'a')
    .replace(/[غ]/g, 'gh')
    .replace(/[ف]/g, 'f')
    .replace(/[ق]/g, 'q')
    .replace(/[ك]/g, 'k')
    .replace(/[ل]/g, 'l')
    .replace(/[م]/g, 'm')
    .replace(/[ن]/g, 'n')
    .replace(/[ه]/g, 'h')
    .replace(/[و]/g, 'w')
    .replace(/[ي]/g, 'y')
    // Remove special characters and diacritics
    .replace(/[ً ٌ ٍ َ ُ ِ ّ ْ]/g, '')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-');
}

/**
 * Generate a unique slug by checking against existing slugs
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a slug meets the requirements
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && !slug.startsWith('-') && !slug.endsWith('-');
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
}