import { prisma } from '../database/prisma';
import { generateSlug, generateUniqueSlug } from '../utils/slug.utils';
import { CreateResearchRequest, UpdateResearchRequest, ResearchResponse, ResearchListResponse, ResearchFilters } from '../types/research.types';

export const createResearch = async (data: CreateResearchRequest): Promise<ResearchResponse> => {
  // Validate category exists and has RESEARCH model type
  const categoryExists = await prisma.category.findFirst({
    where: { 
      id: data.categoryId,
      model: 'RESEARCH'
    }
  });
  if (!categoryExists) {
    throw new Error(`Category with ID ${data.categoryId} does not exist or is not a RESEARCH category`);
  }

  // Validate tags exist
  if (data.tagIds && data.tagIds.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } }
    });
    if (existingTags.length !== data.tagIds.length) {
      const existingTagIds = existingTags.map(tag => tag.id);
      const missingTagIds = data.tagIds.filter(id => !existingTagIds.includes(id));
      throw new Error(`Tags with IDs ${missingTagIds.join(', ')} do not exist`);
    }
  }

  // Validate attachments exist
  if (data.attachmentIds && data.attachmentIds.length > 0) {
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: data.attachmentIds } }
    });
    if (existingAttachments.length !== data.attachmentIds.length) {
      const existingAttachmentIds = existingAttachments.map(attachment => attachment.id);
      const missingAttachmentIds = data.attachmentIds.filter(id => !existingAttachmentIds.includes(id));
      throw new Error(`Attachments with IDs ${missingAttachmentIds.join(', ')} do not exist`);
    }
  }

  // Generate unique slug with Arabic support
  const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
  const baseSlug = generateSlug(defaultTranslation.title);
  
  const existingResearches = await prisma.research.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingResearches.map(research => research.slug);
  const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
  
  const research = await prisma.research.create({
    data: {
      slug: uniqueSlug,
      publishedAt: data.publishedAt,
      pages: data.pages,
      isPublished: data.isPublished ?? false,
      categoryId: data.categoryId,
      translations: { create: data.translations },
      tags: data.tagIds ? {
        create: data.tagIds.map(tagId => ({ tagId }))
      } : undefined,
      attachments: data.attachmentIds ? {
        create: data.attachmentIds.map((attachmentId, index) => ({
          attachmentsId: attachmentId,
          order: index
        }))
      } : undefined
    },
    include: {
      translations: true,
      category: {
        include: { translations: true }
      },
      tags: {
        include: {
          tag: {
            include: { translations: true }
          }
        }
      },
      attachments: {
        include: { attachment: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatResearchResponse(research);
};

export const getResearches = async (lang: string, filters: ResearchFilters = {}, page = 1, limit = 10): Promise<ResearchListResponse> => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = {
      some: { tagId: { in: filters.tagIds } }
    };
  }
  
  if (filters.search) {
    where.translations = {
      some: {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { abstract: { contains: filters.search, mode: 'insensitive' } },
          { authors: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    };
  }

  if (filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }

  if (filters.publishedYear) {
    where.publishedAt = {
      gte: new Date(`${filters.publishedYear}-01-01`),
      lt: new Date(`${parseInt(filters.publishedYear) + 1}-01-01`)
    };
  }

  const [researches, total] = await Promise.all([
    prisma.research.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        translations: true,
        category: { include: { translations: true } },
        tags: { include: { tag: { include: { translations: true } } } },
        attachments: {
          include: { attachment: true },
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.research.count({ where })
  ]);

  return {
    researches: researches.map(research => formatResearchResponse(research, lang)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getResearchById = async (id: number, lang: string): Promise<ResearchResponse | null> => {
  const research = await prisma.research.findUnique({
    where: { id },
    include: {
      translations: true,
      category: { include: { translations: true } },
      tags: { include: { tag: { include: { translations: true } } } },
      attachments: {
        include: { attachment: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!research) return null;

  // Increment views
  await prisma.research.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  return formatResearchResponse(research, lang);
};

export const getResearchBySlug = async (slug: string, lang: string): Promise<ResearchResponse | null> => {
  const research = await prisma.research.findUnique({
    where: { slug },
    include: {
      translations: true,
      category: { include: { translations: true } },
      tags: { include: { tag: { include: { translations: true } } } },
      attachments: {
        include: { attachment: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!research) return null;

  // Increment views
  await prisma.research.update({
    where: { slug },
    data: { views: { increment: 1 } }
  });

  return formatResearchResponse(research, lang);
};

export const updateResearch = async (id: number, data: UpdateResearchRequest): Promise<ResearchResponse | null> => {
  const existingResearch = await prisma.research.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingResearch) return null;

  // Validate category if provided
  if (data.categoryId) {
    const categoryExists = await prisma.category.findFirst({
      where: { 
        id: data.categoryId,
        model: 'RESEARCH'
      }
    });
    if (!categoryExists) {
      throw new Error(`Category with ID ${data.categoryId} does not exist or is not a RESEARCH category`);
    }
  }

  // Validate tags if provided
  if (data.tagIds && data.tagIds.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } }
    });
    if (existingTags.length !== data.tagIds.length) {
      const existingTagIds = existingTags.map(tag => tag.id);
      const missingTagIds = data.tagIds.filter(id => !existingTagIds.includes(id));
      throw new Error(`Tags with IDs ${missingTagIds.join(', ')} do not exist`);
    }
  }

  // Validate attachments if provided
  if (data.attachmentIds && data.attachmentIds.length > 0) {
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: data.attachmentIds } }
    });
    if (existingAttachments.length !== data.attachmentIds.length) {
      const existingAttachmentIds = existingAttachments.map(attachment => attachment.id);
      const missingAttachmentIds = data.attachmentIds.filter(id => !existingAttachmentIds.includes(id));
      throw new Error(`Attachments with IDs ${missingAttachmentIds.join(', ')} do not exist`);
    }
  }

  let updateData: any = {};

  // Handle slug regeneration if title changed
  if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    const currentDefaultTranslation = existingResearch.translations.find(t => t.isDefault);
    
    if (currentDefaultTranslation && defaultTranslation.title !== currentDefaultTranslation.title) {
      const baseSlug = generateSlug(defaultTranslation.title);
      const existingResearches = await prisma.research.findMany({
        select: { slug: true },
        where: { id: { not: id } }
      });
      const existingSlugs = existingResearches.map(research => research.slug);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      updateData.slug = uniqueSlug;
    }

    updateData.translations = {
      deleteMany: {},
      create: data.translations
    };
  }

  // Handle other fields
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

  // Handle tags
  if (data.tagIds) {
    updateData.tags = {
      deleteMany: {},
      create: data.tagIds.map(tagId => ({ tagId }))
    };
  }

  // Handle attachments
  if (data.attachmentIds) {
    updateData.attachments = {
      deleteMany: {},
      create: data.attachmentIds.map((attachmentId, index) => ({
        attachmentsId: attachmentId,
        order: index
      }))
    };
  }

  const updatedResearch = await prisma.research.update({
    where: { id },
    data: updateData,
    include: {
      translations: true,
      category: { include: { translations: true } },
      tags: { include: { tag: { include: { translations: true } } } },
      attachments: {
        include: { attachment: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatResearchResponse(updatedResearch);
};

export const deleteResearch = async (id: number): Promise<boolean> => {
  try {
    await prisma.research.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to format response with proper language handling
const formatResearchResponse = (research: any, lang?: string): ResearchResponse => {
  const translation = lang 
    ? research.translations.find((t: any) => t.languageCode === lang) || research.translations.find((t: any) => t.isDefault)
    : research.translations.find((t: any) => t.isDefault);

  return {
    id: research.id,
    slug: research.slug,
    title: translation?.title || '',
    abstract: translation?.abstract || undefined,
    authors: translation?.authors || undefined,
    metaTitle: translation?.metaTitle || undefined,
    metaDescription: translation?.metaDescription || undefined,
    publishedAt: research.publishedAt,
    pages: research.pages,
    views: research.views,
    isPublished: research.isPublished,
    createdAt: research.createdAt,
    updatedAt: research.updatedAt,
    category: {
      id: research.category.id,
      slug: research.category.slug,
      name: getCategoryName(research.category, lang)
    },
    tags: research.tags?.map((researchTag: any) => ({
      id: researchTag.tag.id,
      slug: researchTag.tag.slug,
      name: getTagName(researchTag.tag, lang)
    })),
    attachments: research.attachments?.map((researchAttachment: any) => ({
      id: researchAttachment.attachment.id,
      originalName: researchAttachment.attachment.originalName,
      fileName: researchAttachment.attachment.fileName,
      path: researchAttachment.attachment.path,
      mimeType: researchAttachment.attachment.mimeType,
      size: researchAttachment.attachment.size,
      altText: researchAttachment.attachment.altText,
      order: researchAttachment.order
    }))
  };
};

const getCategoryName = (category: any, lang?: string): string => {
  const translation = lang 
    ? category.translations.find((t: any) => t.languageCode === lang) || category.translations.find((t: any) => t.isDefault)
    : category.translations.find((t: any) => t.isDefault);
  return translation?.name || '';
};

const getTagName = (tag: any, lang?: string): string => {
  const translation = lang 
    ? tag.translations.find((t: any) => t.languageCode === lang) || tag.translations.find((t: any) => t.isDefault)
    : tag.translations.find((t: any) => t.isDefault);
  return translation?.name || '';
};