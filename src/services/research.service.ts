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
  const category = await prisma.researchTranslationCategory.findUnique({
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
      date: new Date(data.date),
      views: 0,
      pages: data.pages,
      categoryId: data.categoryId,
      translations: {
        create: data.translations.map(translation => ({
          languageCode: translation.languageCode,
          isDefault: translation.isDefault,
          title: translation.title,
          abstract: translation.abstract
        }))
      },
      ...(data.attachments && data.attachments.length > 0 && {
        attachments: {
          create: data.attachments.map(attachment => ({
            attachmentsId: attachment.attachmentId,
            type: attachment.type,
            order: attachment.order
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
    where.date = {
      gte: yearStart,
      lt: yearEnd
    };
  } else if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) {
      where.date.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.date.lte = new Date(dateTo);
    }
  }

  if (search || languageCode) {
    where.translations = {
      some: {
        ...(languageCode && { languageCode }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { abstract: { contains: search, mode: 'insensitive' } }
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
      orderBy: { date: 'desc' },
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
  if (data.date) updateData.date = new Date(data.date);
  if (data.pages !== undefined) updateData.pages = data.pages;
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
        abstract: translation.abstract
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
          order: attachment.order
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
  const existingCategory = await prisma.researchTranslationCategory.findUnique({
    where: { slug: data.slug }
  });

  if (existingCategory) {
    throw new Error("RESEARCH_CATEGORY_SLUG_EXISTS");
  }

  const category = await prisma.researchTranslationCategory.create({
    data: {
      slug: data.slug,
      name: data.name
    }
  });

  return formatResearchCategoryResponse(category);
}

export async function getResearchCategories(): Promise<ResearchCategoryResponse[]> {
  const categories = await prisma.researchTranslationCategory.findMany({
    include: {
      _count: {
        select: { researches: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return categories.map(category => ({
    id: category.id,
    slug: category.slug || undefined,
    name: category.name || undefined,
    researchCount: category._count.researches
  }));
}

export async function updateResearchCategory(id: number, data: UpdateResearchCategoryRequest): Promise<ResearchCategoryResponse> {
  const existingCategory = await prisma.researchTranslationCategory.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new Error("RESEARCH_CATEGORY_NOT_FOUND");
  }

  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.researchTranslationCategory.findUnique({
      where: { slug: data.slug }
    });
    if (slugExists) {
      throw new Error("RESEARCH_CATEGORY_SLUG_EXISTS");
    }
  }

  const category = await prisma.researchTranslationCategory.update({
    where: { id },
    data: {
      ...(data.slug && { slug: data.slug }),
      ...(data.name && { name: data.name })
    }
  });

  return formatResearchCategoryResponse(category);
}

export async function deleteResearchCategory(id: number): Promise<void> {
  const category = await prisma.researchTranslationCategory.findUnique({
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

  await prisma.researchTranslationCategory.delete({
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
    date: research.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    views: research.views,
    pages: research.pages,
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
      language: translation.language
    })),
    attachments: research.attachments ? research.attachments.map((item: any) => ({
      id: item.id,
      researchId: item.researchId,
      attachmentId: item.attachmentsId,
      type: item.type,
      order: item.order,
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
    slug: category.slug || undefined,
    name: category.name || undefined
  };
}