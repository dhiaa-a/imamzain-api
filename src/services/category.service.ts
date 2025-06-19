// src/services/category.service.ts
import { prisma } from "../database/prisma";
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  GetCategoriesQuery,
  CategoryResponse 
} from "../types/category.types";
import { SupportedLanguageCode, isSupportedLanguage } from "../types/language.types";
import { generateSlug, generateUniqueSlug, isValidSlug } from "../utils/slug.utils";

export async function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
  // If translations are provided, validate them
  if (data.translations) {
    const languageCodes = data.translations.map(t => t.languageCode);
    const unsupportedLanguages = languageCodes.filter(code => !isSupportedLanguage(code));
    if (unsupportedLanguages.length > 0) {
      throw new Error(`UNSUPPORTED_LANGUAGES: ${unsupportedLanguages.join(', ')}`);
    }
   
    // Ensure only one default translation
    const defaultTranslations = data.translations.filter(t => t.isDefault);
    if (defaultTranslations.length > 1) {
      throw new Error("ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED");
    }
  }

  // Generate slug if not provided
  let slug = data.slug;
  if (!slug) {
    slug = generateSlug(data.name);
  } else {
    // Validate provided slug
    if (!isValidSlug(slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
  }

  // Ensure slug is unique
  const existingCategories = await prisma.articleCategory.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingCategories.map(category => category.slug);
  const uniqueSlug = generateUniqueSlug(slug, existingSlugs);

  // Create category with name field
  const category = await prisma.articleCategory.create({
    data: {
      slug: uniqueSlug,
      name: data.name
    }
  });

  return formatCategoryResponse(category);
}

export async function getCategoryById(id: number, languageCode?: SupportedLanguageCode): Promise<CategoryResponse | null> {
  const category = await prisma.articleCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { articles: true }
      }
    }
  });

  if (!category) {
    return null;
  }

  return formatCategoryResponse(category);
}

export async function getCategoryBySlug(slug: string, languageCode?: SupportedLanguageCode): Promise<CategoryResponse | null> {
  const category = await prisma.articleCategory.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { articles: true }
      }
    }
  });

  if (!category) {
    return null;
  }

  return formatCategoryResponse(category);
}

export async function getCategories(query: GetCategoriesQuery = {}) {
  const { page = 1, limit = 10, languageCode, search, includeCount = false } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  const [categories, total] = await Promise.all([
    prisma.articleCategory.findMany({
      where,
      include: includeCount ? {
        _count: {
          select: { articles: true }
        }
      } : undefined,
      orderBy: { id: 'desc' }, // Using id instead of createdAt
      skip,
      take: limit
    }),
    prisma.articleCategory.count({ where })
  ]);

  return {
    categories: categories.map(formatCategoryResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
  const existingCategory = await prisma.articleCategory.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  // Handle slug update
  let slugToUpdate = data.slug;
  let nameToUpdate = data.name;
  
  if (data.translations && data.translations.length > 0) {
    // Validate translations if provided
    const languageCodes = data.translations.map(t => t.languageCode);
    const unsupportedLanguages = languageCodes.filter(code => !isSupportedLanguage(code));
    if (unsupportedLanguages.length > 0) {
      throw new Error(`UNSUPPORTED_LANGUAGES: ${unsupportedLanguages.join(', ')}`);
    }

    const defaultTranslations = data.translations.filter(t => t.isDefault);
    if (defaultTranslations.length > 1) {
      throw new Error("ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED");
    }

    // Use the first translation's name or the default one
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    nameToUpdate = defaultTranslation.name;
    
    if (!data.slug) {
      // Generate slug from name if not provided
      const newSlug = generateSlug(defaultTranslation.name);
      const existingCategories = await prisma.articleCategory.findMany({
        where: { id: { not: id } },
        select: { slug: true }
      });
      const existingSlugs = existingCategories.map(category => category.slug);
      slugToUpdate = generateUniqueSlug(newSlug, existingSlugs);
    }
  }
  
  if (data.slug) {
    // If slug is provided, validate it
    if (!isValidSlug(data.slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
    
    // Check slug uniqueness if updating slug
    if (data.slug !== existingCategory.slug) {
      const slugExists = await prisma.articleCategory.findFirst({
        where: { slug: data.slug, id: { not: id } }
      });
      if (slugExists) {
        // Generate unique slug
        const existingCategories = await prisma.articleCategory.findMany({
          where: { id: { not: id } },
          select: { slug: true }
        });
        const existingSlugs = existingCategories.map(category => category.slug);
        slugToUpdate = generateUniqueSlug(data.slug, existingSlugs);
      }
    }
  }

  const updateData: any = {};
  
  if (slugToUpdate) updateData.slug = slugToUpdate;
  if (nameToUpdate) updateData.name = nameToUpdate;

  const category = await prisma.articleCategory.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: { articles: true }
      }
    }
  });

  return formatCategoryResponse(category);
}

export async function deleteCategory(id: number): Promise<void> {
  const category = await prisma.articleCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { articles: true }
      }
    }
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  // Check if category has articles
  if (category._count.articles > 0) {
    throw new Error("CATEGORY_HAS_ARTICLES");
  }

  // Delete the category
  await prisma.articleCategory.delete({
    where: { id }
  });
}

function formatCategoryResponse(category: any): CategoryResponse {
  return {
    id: category.id,
    slug: category.slug,
    createdAt: category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString(),
    translations: [{
      id: category.id,
      categoryId: category.id,
      languageCode: 'ar' as SupportedLanguageCode, // Default to Arabic
      isDefault: true,
      name: category.name,
      description: undefined,
      language: {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية'
      }
    }],
    ...(category._count && { _count: category._count })
  };
}