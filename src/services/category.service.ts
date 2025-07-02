import { prisma } from '../database/prisma';
import { generateSlug } from '../utils/slug.utils';
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryResponse, 
  CategoryListResponse, 
  CategoryFilters 
} from '../types/category.types';

export const createCategory = async (
  data: CreateCategoryRequest,
  lang: string
): Promise<CategoryResponse> => {
  // Generate slug if not provided or ensure uniqueness
  const finalSlug = data.slug || generateSlug(data.translations.find(t => t.isDefault)?.name || '');
  
  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug: finalSlug }
  });

  if (existingCategory) {
    throw new Error('Category with this slug already exists');
  }

  // Create category with translations
  const category = await prisma.category.create({
    data: {
      slug: finalSlug,
      model: data.model,
      isActive: data.isActive ?? true,
      translations: {
        create: data.translations.map(translation => ({
          languageCode: translation.languageCode,
          isDefault: translation.isDefault,
          name: translation.name,
        }))
      }
    },
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  // If no translation found for requested language, get default
  if (category.translations.length === 0) {
    const categoryWithDefault = await prisma.category.findUnique({
      where: { id: category.id },
      include: {
        translations: {
          where: {
            isDefault: true
          }
        }
      }
    });
    
    return {
      ...category,
      translations: categoryWithDefault?.translations || []
    };
  }

  return category;
};

export const getCategories = async (
  filters: CategoryFilters,
  lang: string
): Promise<CategoryListResponse> => {
  const { model, isActive, search, page = 1, limit = 10 } = filters;
  
  const skip = (page - 1) * limit;
  
  const where: any = {};
  
  if (model) {
    where.model = model;
  }
  
  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }
  
  if (search) {
    where.translations = {
      some: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      }
    };
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        translations: {
          where: {
            OR: [
              { languageCode: lang },
              { isDefault: true }
            ]
          },
          orderBy: [
            { languageCode: lang ? 'asc' : 'desc' },
            { isDefault: 'desc' }
          ],
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    }),
    prisma.category.count({ where })
  ]);

  return {
    categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getCategoryById = async (
  id: number,
  lang: string
): Promise<CategoryResponse | null> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  if (!category) {
    return null;
  }

  // If no translation found for requested language, get default
  if (category.translations.length === 0) {
    const categoryWithDefault = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: {
          where: {
            isDefault: true
          }
        }
      }
    });
    
    return categoryWithDefault ? {
      ...category,
      translations: categoryWithDefault.translations
    } : null;
  }

  return category;
};

export const getCategoryBySlug = async (
  slug: string,
  lang: string
): Promise<CategoryResponse | null> => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  if (!category) {
    return null;
  }

  // If no translation found for requested language, get default
  if (category.translations.length === 0) {
    const categoryWithDefault = await prisma.category.findUnique({
      where: { slug },
      include: {
        translations: {
          where: {
            isDefault: true
          }
        }
      }
    });
    
    return categoryWithDefault ? {
      ...category,
      translations: categoryWithDefault.translations
    } : null;
  }

  return category;
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest,
  lang: string
): Promise<CategoryResponse | null> => {
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    return null;
  }

  // Check if slug is being updated and if it already exists
  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new Error('Category with this slug already exists');
    }
  }

  const updateData: any = {};
  
  if (data.slug) updateData.slug = data.slug;
  if (data.model) updateData.model = data.model;
  if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

  // Handle translations update
  if (data.translations) {
    // Delete existing translations and create new ones
    await prisma.categoryTranslation.deleteMany({
      where: { categoryId: id }
    });

    updateData.translations = {
      create: data.translations.map(translation => ({
        languageCode: translation.languageCode,
        isDefault: translation.isDefault,
        name: translation.name,
      }))
    };
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  // If no translation found for requested language, get default
  if (category.translations.length === 0) {
    const categoryWithDefault = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: {
          where: {
            isDefault: true
          }
        }
      }
    });
    
    return categoryWithDefault ? {
      ...category,
      translations: categoryWithDefault.translations
    } : null;
  }

  return category;
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      articles: true,
      researches: true,
      books: true
    }
  });

  if (!category) {
    return false;
  }

  // Check if category is being used
  const isInUse = category.articles.length > 0 || 
                  category.researches.length > 0 || 
                  category.books.length > 0;

  if (isInUse) {
    throw new Error('Cannot delete category that is being used by articles, researches, or books');
  }

  await prisma.category.delete({
    where: { id }
  });

  return true;
};