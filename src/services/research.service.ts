// src/services/research.service.ts
import { prisma } from "../database/prisma";
import { 
  CreateResearchRequest, 
  UpdateResearchRequest, 
  GetResearchQuery,
  ResearchResponse,
  CreateResearchCategoryRequest,
  UpdateResearchCategoryRequest,
  ResearchCategoryResponse
} from "../types/research.types";
import { generateSlug, generateUniqueSlug, isValidSlug } from "../utils/slug.utils";

export async function createResearch(data: CreateResearchRequest): Promise<ResearchResponse> {
  // Check if category exists
  const category = await prisma.researchCategory.findUnique({
    where: { id: data.categoryId }
  });
  
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  // Check if languages exist
  const languageCodes = data.translations.map(t => t.languageCode);
  const languages = await prisma.language.findMany({
    where: { code: { in: languageCodes } }
  });
  
  if (languages.length !== languageCodes.length) {
    throw new Error("INVALID_LANGUAGE_CODES");
  }

  // Ensure only one default translation
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  if (defaultTranslations.length !== 1) {
    throw new Error("EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED");
  }

  // Generate slug if not provided
  let slug = data.slug;
  if (!slug) {
    const defaultTranslation = defaultTranslations[0];
    slug = generateSlug(defaultTranslation.title);
  } else {
    if (!isValidSlug(slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
  }

  // Ensure slug is unique
  const existingResearch = await prisma.research.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingResearch.map(research => research.slug);
  const uniqueSlug = generateUniqueSlug(slug, existingSlugs);

  // If attachments are provided, verify they exist
  if (data.attachments && data.attachments.length > 0) {
    const attachmentIds = data.attachments.map(a => a.attachmentId);
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: attachmentIds } }
    });

    if (existingAttachments.length !== attachmentIds.length) {
      throw new Error("SOME_ATTACHMENTS_NOT_FOUND");
    }

    // Check for duplicate attachment IDs
    const duplicateIds = attachmentIds.filter((id, index) => attachmentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_IDS");
    }

    // Check for duplicate orders
    const orders = data.attachments.map(a => a.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_ORDERS");
    }
  }

  const research = await prisma.research.create({
    data: {
      slug: uniqueSlug,
      publishedAt: new Date(data.date),
      views: 0,
      pages: data.pages,
      isPublished: data.isPublished || false,
      categoryId: data.categoryId,
      translations: {
        create: data.translations.map(translation => ({
          languageCode: translation.languageCode,
          isDefault: translation.isDefault,
          title: translation.title,
          abstract: translation.abstract,
          keywords: translation.keywords,
          authors: translation.authors,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription
        }))
      },
      ...(data.attachments && data.attachments.length > 0 && {
        attachments: {
          create: data.attachments.map(attachment => ({
            attachmentsId: attachment.attachmentId,
            type: attachment.type,
            order: attachment.order,
            caption: attachment.caption
          }))
        }
      })
    },
    include: {
      category: true,
      translations: {
        include: {
          language: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatResearchResponse(research);
}

export async function getResearchById(id: number, languageCode?: string): Promise<ResearchResponse | null> {
  const research = await prisma.research.findUnique({
    where: { id },
    include: {
      category: true,
      translations: {
        where: languageCode ? { languageCode } : {},
        include: {
          language: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!research) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && research.translations.length === 0) {
    const researchWithDefault = await prisma.research.findUnique({
      where: { id },
      include: {
        category: true,
        translations: {
          where: { isDefault: true },
          include: {
            language: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return researchWithDefault ? formatResearchResponse(researchWithDefault) : null;
  }

  return formatResearchResponse(research);
}

export async function getResearchBySlug(slug: string, languageCode?: string): Promise<ResearchResponse | null> {
  const research = await prisma.research.findFirst({
    where: { slug },
    include: {
      category: true,
      translations: {
        where: languageCode ? { languageCode } : {},
        include: {
          language: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!research) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && research.translations.length === 0) {
    const researchWithDefault = await prisma.research.findFirst({
      where: { slug },
      include: {
        category: true,
        translations: {
          where: { isDefault: true },
          include: {
            language: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return researchWithDefault ? formatResearchResponse(researchWithDefault) : null;
  }

  // Increment views
  await prisma.research.update({
    where: { id: research.id },
    data: { views: { increment: 1 } }
  });

  return formatResearchResponse(research);
}

export async function getResearch(query: GetResearchQuery = {}) {
  const { page = 1, limit = 10, categoryId, languageCode, search, year, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Date filtering
  if (year) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    where.publishedAt = {
      gte: yearStart,
      lt: yearEnd
    };
  } else if (dateFrom || dateTo) {
    where.publishedAt = {};
    if (dateFrom) {
      where.publishedAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.publishedAt.lte = new Date(dateTo);
    }
  }

  if (search || languageCode) {
    where.translations = {
      some: {
        ...(languageCode && { languageCode }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { abstract: { contains: search, mode: 'insensitive' } },
            { keywords: { contains: search, mode: 'insensitive' } },
            { authors: { contains: search, mode: 'insensitive' } }
          ]
        })
      }
    };
  }

  const [research, total] = await Promise.all([
    prisma.research.findMany({
      where,
      include: {
        category: true,
        translations: {
          where: languageCode ? { languageCode } : { isDefault: true },
          include: {
            language: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.research.count({ where })
  ]);

  return {
    research: research.map(formatResearchResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateResearch(id: number, data: UpdateResearchRequest): Promise<ResearchResponse> {
  const existingResearch = await prisma.research.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingResearch) {
    throw new Error("RESEARCH_NOT_FOUND");
  }

  // Handle slug update
  let slugToUpdate = data.slug;
  
  if (data.slug) {
    if (!isValidSlug(data.slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
    
    if (data.slug !== existingResearch.slug) {
      const slugExists = await prisma.research.findFirst({
        where: { slug: data.slug, id: { not: id } }
      });
      if (slugExists) {
        const existingResearch = await prisma.research.findMany({
          where: { id: { not: id } },
          select: { slug: true }
        });
        const existingSlugs = existingResearch.map(research => research.slug);
        slugToUpdate = generateUniqueSlug(data.slug, existingSlugs);
      }
    }
  } else if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault);
    if (defaultTranslation) {
      const newSlug = generateSlug(defaultTranslation.title);
      const existingResearch = await prisma.research.findMany({
        where: { id: { not: id } },
        select: { slug: true }
      });
      const existingSlugs = existingResearch.map(research => research.slug);
      slugToUpdate = generateUniqueSlug(newSlug, existingSlugs);
    }
  }

  // Validate translations if provided
  if (data.translations) {
    const languageCodes = data.translations.map(t => t.languageCode);
    const languages = await prisma.language.findMany({
      where: { code: { in: languageCodes } }
    });
    
    if (languages.length !== languageCodes.length) {
      throw new Error("INVALID_LANGUAGE_CODES");
    }

    const defaultTranslations = data.translations.filter(t => t.isDefault);
    if (defaultTranslations.length > 1) {
      throw new Error("ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED");
    }
  }

  // If attachments are provided, verify they exist
  if (data.attachments && data.attachments.length > 0) {
    const attachmentIds = data.attachments.map(a => a.attachmentId);
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: attachmentIds } }
    });

    if (existingAttachments.length !== attachmentIds.length) {
      throw new Error("SOME_ATTACHMENTS_NOT_FOUND");
    }

    const duplicateIds = attachmentIds.filter((id, index) => attachmentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_IDS");
    }

    const orders = data.attachments.map(a => a.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_ORDERS");
    }
  }

  const updateData: any = {};
  
  if (slugToUpdate) updateData.slug = slugToUpdate;
  if (data.date) updateData.publishedAt = new Date(data.date);
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
  if (data.categoryId) updateData.categoryId = data.categoryId;

  const research = await prisma.research.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      translations: {
        include: {
          language: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  // Update translations if provided
  if (data.translations) {
    await prisma.researchTranslation.deleteMany({
      where: { researchId: id }
    });

    await prisma.researchTranslation.createMany({
      data: data.translations.map(translation => ({
        researchId: id,
        languageCode: translation.languageCode,
        isDefault: translation.isDefault || false,
        title: translation.title,
        abstract: translation.abstract,
        keywords: translation.keywords,
        authors: translation.authors,
        metaTitle: translation.metaTitle,
        metaDescription: translation.metaDescription
      }))
    });
  }

  // Update attachments if provided
  if (data.attachments !== undefined) {
    await prisma.researchAttachments.deleteMany({
      where: { researchId: id }
    });

    if (data.attachments.length > 0) {
      await prisma.researchAttachments.createMany({
        data: data.attachments.map(attachment => ({
          researchId: id,
          attachmentsId: attachment.attachmentId,
          type: attachment.type,
          order: attachment.order,
          caption: attachment.caption
        }))
      });
    }
  }

  // Fetch updated research with all relations
  const updatedResearch = await prisma.research.findUnique({
    where: { id },
    include: {
      category: true,
      translations: {
        include: {
          language: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatResearchResponse(updatedResearch!);
}

export async function deleteResearch(id: number): Promise<void> {
  const research = await prisma.research.findUnique({
    where: { id }
  });

  if (!research) {
    throw new Error("RESEARCH_NOT_FOUND");
  }

  // Delete related records first to avoid foreign key constraint violations
  await prisma.researchTranslation.deleteMany({
    where: { researchId: id }
  });

  await prisma.researchAttachments.deleteMany({
    where: { researchId: id }
  });

  // Now delete the research itself
  await prisma.research.delete({
    where: { id }
  });
}

// Research Category functions
export async function createResearchCategory(data: CreateResearchCategoryRequest): Promise<ResearchCategoryResponse> {
  const existingCategory = await prisma.researchCategory.findUnique({
    where: { slug: data.slug }
  });

  if (existingCategory) {
    throw new Error("RESEARCH_CATEGORY_SLUG_EXISTS");
  }

  const category = await prisma.researchCategory.create({
    data: {
      slug: data.slug,
      parentId: data.parentId,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      ...(data.translations && data.translations.length > 0 && {
        translations: {
          create: data.translations.map(translation => ({
            languageCode: translation.languageCode,
            isDefault: translation.isDefault || false,
            name: translation.name,
            description: translation.description,
            metaTitle: translation.metaTitle,
            metaDescription: translation.metaDescription
          }))
        }
      })
    },
    include: {
      translations: {
        include: {
          language: true
        }
      },
      _count: {
        select: { researches: true }
      }
    }
  });

  return formatResearchCategoryResponse(category);
}

export async function getResearchCategories(languageCode?: string): Promise<ResearchCategoryResponse[]> {
  const categories = await prisma.researchCategory.findMany({
    include: {
      translations: {
        where: languageCode ? { languageCode } : { isDefault: true },
        include: {
          language: true
        }
      },
      _count: {
        select: { researches: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  return categories.map(formatResearchCategoryResponse);
}

export async function updateResearchCategory(id: number, data: UpdateResearchCategoryRequest): Promise<ResearchCategoryResponse> {
  const existingCategory = await prisma.researchCategory.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new Error("RESEARCH_CATEGORY_NOT_FOUND");
  }

  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.researchCategory.findUnique({
      where: { slug: data.slug }
    });
    if (slugExists) {
      throw new Error("RESEARCH_CATEGORY_SLUG_EXISTS");
    }
  }

  const category = await prisma.researchCategory.update({
    where: { id },
    data: {
      ...(data.slug && { slug: data.slug }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    },
    include: {
      translations: {
        include: {
          language: true
        }
      },
      _count: {
        select: { researches: true }
      }
    }
  });

  // Update translations if provided
  if (data.translations) {
    // Delete existing translations
    await prisma.researchCategoryTranslation.deleteMany({
      where: { categoryId: id }
    });

    // Create new translations
    await prisma.researchCategoryTranslation.createMany({
      data: data.translations.map(translation => ({
        categoryId: id,
        languageCode: translation.languageCode,
        isDefault: translation.isDefault || false,
        name: translation.name,
        description: translation.description,
        metaTitle: translation.metaTitle,
        metaDescription: translation.metaDescription
      }))
    });

    // Fetch updated category with new translations
    const updatedCategory = await prisma.researchCategory.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true
          }
        },
        _count: {
          select: { researches: true }
        }
      }
    });

    return formatResearchCategoryResponse(updatedCategory!);
  }

  return formatResearchCategoryResponse(category);
}

export async function deleteResearchCategory(id: number): Promise<void> {
  const category = await prisma.researchCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { researches: true }
      }
    }
  });

  if (!category) {
    throw new Error("RESEARCH_CATEGORY_NOT_FOUND");
  }

  if (category._count.researches > 0) {
    throw new Error("RESEARCH_CATEGORY_HAS_RESEARCH");
  }

  // Delete translations first
  await prisma.researchCategoryTranslation.deleteMany({
    where: { categoryId: id }
  });

  await prisma.researchCategory.delete({
    where: { id }
  });
}

function formatResearchResponse(research: any): ResearchResponse {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://api.example.com' 
    : `http://localhost:${process.env.PORT || 8000}`;

  return {
    id: research.id,
    slug: research.slug,
    publishedAt: research.publishedAt ? research.publishedAt.toISOString().split('T')[0] : null,
    views: research.views,
    pages: research.pages,
    isPublished: research.isPublished,
    categoryId: research.categoryId,
    createdAt: research.createdAt.toISOString(),
    updatedAt: research.updatedAt.toISOString(),
    category: research.category,
    translations: research.translations.map((translation: any) => ({
      id: translation.id,
      researchId: translation.researchId,
      languageCode: translation.languageCode,
      isDefault: translation.isDefault,
      title: translation.title,
      abstract: translation.abstract,
      keywords: translation.keywords,
      authors: translation.authors,
      metaTitle: translation.metaTitle,
      metaDescription: translation.metaDescription,
      language: translation.language
    })),
    attachments: research.attachments ? research.attachments.map((item: any) => ({
      id: item.id,
      researchId: item.researchId,
      attachmentId: item.attachmentsId,
      type: item.type,
      order: item.order,
      caption: item.caption,
      attachment: {
        id: item.attachment.id,
        originalName: item.attachment.originalName,
        fileName: item.attachment.fileName,
        path: item.attachment.path,
        mimeType: item.attachment.mimeType,
        size: item.attachment.size,
        disk: item.attachment.disk,
        collection: item.attachment.collection,
        altText: item.attachment.altText,
        metadata: item.attachment.metadata,
        createdAt: item.attachment.createdAt.toISOString(),
        updatedAt: item.attachment.updatedAt.toISOString(),
        url: `${baseUrl}/api/v1/attachments/uploads/${item.attachment.path}`
      }
    })) : []
  };
}

function formatResearchCategoryResponse(category: any): ResearchCategoryResponse {
  return {
    id: category.id,
    slug: category.slug,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    translations: category.translations.map((translation: any) => ({
      id: translation.id,
      categoryId: translation.categoryId,
      languageCode: translation.languageCode,
      isDefault: translation.isDefault,
      name: translation.name,
      description: translation.description,
      metaTitle: translation.metaTitle,
      metaDescription: translation.metaDescription,
      language: translation.language
    })),
    researchCount: category._count?.researches || 0
  };
}