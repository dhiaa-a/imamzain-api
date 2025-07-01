// File: src/services/articleCategory.service.ts
import { prisma } from "../database/prisma";
import {
  CreateBookCategoryRequest,
  UpdateBookCategoryRequest,
  BookCategoryResponse,
} from "../types/bookCategory.types";
import { generateSlug, generateUniqueSlug } from "../utils/slug.utils";

export const createCategory = async (
  data: CreateBookCategoryRequest
): Promise<BookCategoryResponse> => {
  const { translations, ...categoryData } = data;

  // Generate slug from default translation name if not provided
  let slug = data.slug;
  if (!slug) {
    const defaultTranslation =
      translations.find((t) => t.isDefault) || translations[0];
    const baseSlug = generateSlug(defaultTranslation.name);

    // Get existing slugs to ensure uniqueness
    const existingCategories = await prisma.bookCategory.findMany({
      select: { slug: true },
    });
    const existingSlugs = existingCategories.map((cat) => cat.slug);

    slug = generateUniqueSlug(baseSlug, existingSlugs);
  }

  const category = await prisma.bookCategory.create({
    data: {
      ...categoryData,
      slug,
      translations: {
        create: translations,
      },
    },
    include: {
      translations: true,
      parent: {
        include: {
          translations: true,
        },
      },
      children: {
        include: {
          translations: true,
        },
      },
    },
  });

  return category;
};

export const getAllCategories = async (params: {
  page: number;
  limit: number;
  parentId?: number;
  isActive?: boolean;
  languageCode?: string;
  search?: string;
}) => {
  const { page, limit, parentId, isActive, languageCode, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.translations = {
      some: {
        name: { contains: search, mode: "insensitive" },
      },
    };
  }

  if (languageCode) {
    where.translations = {
      ...where.translations,
      some: {
        ...where.translations?.some,
        languageCode,
      },
    };
  }

  const [categories, total] = await Promise.all([
    prisma.bookCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      include: {
        translations: languageCode ? { where: { languageCode } } : true,
        parent: {
          include: {
            translations: languageCode ? { where: { languageCode } } : true,
          },
        },
        children: {
          include: {
            translations: languageCode ? { where: { languageCode } } : true,
          },
        },
      },
    }),
    prisma.bookCategory.count({ where }),
  ]);

  return {
    data: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCategoryById = async (
  id: number
): Promise<BookCategoryResponse | null> => {
  const category = await prisma.bookCategory.findUnique({
    where: { id },
    include: {
      translations: true,
      parent: {
        include: {
          translations: true,
        },
      },
      children: {
        include: {
          translations: true,
        },
      },
    },
  });

  return category;
};

export const getCategoryBySlug = async (
  slug: string
): Promise<BookCategoryResponse | null> => {
  const category = await prisma.bookCategory.findUnique({
    where: { slug },
    include: {
      translations: true,
      parent: {
        include: {
          translations: true,
        },
      },
      children: {
        include: {
          translations: true,
        },
      },
    },
  });

  return category;
};

export const updateCategory = async (
  id: number,
  data: UpdateBookCategoryRequest
): Promise<BookCategoryResponse> => {
  const { translations, ...categoryData } = data;

  const updateData: any = { ...categoryData };

  // Generate slug from default translation name if not provided but translations are being updated
  if (!data.slug && translations) {
    const defaultTranslation =
      translations.find((t) => t.isDefault) || translations[0];
    if (defaultTranslation) {
      const baseSlug = generateSlug(defaultTranslation.name);

      // Get existing slugs to ensure uniqueness (exclude current category)
      const existingCategories = await prisma.bookCategory.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });
      const existingSlugs = existingCategories.map((cat) => cat.slug);

      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }
  }

  if (translations) {
    // Delete existing translations and create new ones
    await prisma.bookCategoryTranslation.deleteMany({
      where: { categoryId: id },
    });

    updateData.translations = {
      create: translations.map(({ id: _, ...translation }) => translation),
    };
  }

  const category = await prisma.bookCategory.update({
    where: { id },
    data: updateData,
    include: {
      translations: true,
      parent: {
        include: {
          translations: true,
        },
      },
      children: {
        include: {
          translations: true,
        },
      },
    },
  });

  return category;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await prisma.bookCategory.delete({
    where: { id },
  });
};

export const checkSlugExists = async (
  slug: string,
  excludeId?: number
): Promise<boolean> => {
  const category = await prisma.bookCategory.findUnique({
    where: { slug },
  });

  if (!category) return false;
  if (excludeId && category.id === excludeId) return false;
  return true;
};

export const checkParentExists = async (parentId: number): Promise<boolean> => {
  const parent = await prisma.bookCategory.findUnique({
    where: { id: parentId },
  });

  return !!parent;
};
