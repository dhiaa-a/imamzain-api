// src/utils/slug.utils.ts

/**
 * Arabic to Latin transliteration map
 */
const arabicToLatinMap: { [key: string]: string } = {
  // Arabic letters
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
  'ب': 'b',
  'ت': 't',
  'ث': 'th',
  'ج': 'j',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'dh',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'd',
  'ط': 't',
  'ظ': 'z',
  'ع': 'a',
  'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ى': 'a',
  'ة': 'h',
  'ء': '',
  
  // Persian specific letters
  'پ': 'p',
  'چ': 'ch',
  'ژ': 'zh',
  'گ': 'g',
  'ک': 'k',
  
  // Urdu specific letters
  'ٹ': 't',
  'ڈ': 'd',
  'ڑ': 'r',
  'ں': 'n',
  'ے': 'e',
  
  // Additional Arabic forms
  'ئ': 'e',
  'ؤ': 'o',
  'لا': 'la',
  
  // Diacritics (usually removed)
  'َ': '', 'ُ': '', 'ِ': '', 'ً': '', 'ٌ': '', 'ٍ': '',
  'ْ': '', 'ّ': '', 'ـ': ''
};

/**
 * Transliterate Arabic/Persian/Urdu text to Latin characters
 */
function transliterateArabic(text: string): string {
  let result = text;
  
  // Replace Arabic characters with Latin equivalents
  for (const [arabic, latin] of Object.entries(arabicToLatinMap)) {
    result = result.replace(new RegExp(arabic, 'g'), latin);
  }
  
  return result;
}

/**
 * Generate a URL-friendly slug from a title
 * Supports Arabic, Persian, Urdu, and English text
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }

  return title
    .toLowerCase()
    .trim()
    // First transliterate Arabic/Persian/Urdu characters
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, (match) => {
      return transliterateArabic(match);
    })
    // Normalize Unicode characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove any remaining special characters except alphanumeric, spaces, and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces, underscores, and hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if truncated
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  // If base slug is empty, generate a fallback
  if (!slug) {
    slug = `item-${Date.now()}`;
  }

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a slug follows the correct format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

/**
 * Clean text before slug generation
 */
export function cleanTextForSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

