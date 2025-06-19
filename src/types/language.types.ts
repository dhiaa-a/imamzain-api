// src/types/language.types.ts

export type SupportedLanguageCode = 'ar' | 'fa' | 'en' | 'ur';

export interface SupportedLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'ar';

export function isSupportedLanguage(code: string): code is SupportedLanguageCode {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}