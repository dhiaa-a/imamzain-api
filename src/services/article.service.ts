import { prisma } from '../database/prisma';
import { generateSlug, generateUniqueSlug } from '../utils/slug.utils';
import { CreateArticleRequest, UpdateArticleRequest, ArticleResponse, ArticleListResponse, ArticleFilters } from '../types/article.types';

export const createArticle = async (data: CreateArticleRequest): Promise<ArticleResponse> => {
  // Validate that category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId }
  });
  
  if (!categoryExists) {
    throw new Error(`Category with ID ${data.categoryId} does not exist`);
  }

  // Validate that all tags exist if provided
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

  // Validate that all attachments exist if provided
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

  // Validate main image exists if provided
  if (data.mainImageId) {
    const mainImageExists = await prisma.attachments.findUnique({
      where: { id: data.mainImageId }
    });
    
    if (!mainImageExists) {
      throw new Error(`Main image with ID ${data.mainImageId} does not exist`);
    }
  }

  // Generate unique slug
  const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
  const baseSlug = generateSlug(defaultTranslation.title);
  
  // Get all existing article slugs to ensure uniqueness
  const existingArticles = await prisma.article.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingArticles.map(article => article.slug);
  
  // Generate unique slug
  const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
  
  const article = await prisma.article.create({
    data: {
      slug: uniqueSlug,
      categoryId: data.categoryId,
      mainImageId: data.mainImageId, // Add main image support
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      isPublished: data.isPublished || false,
      translations: {
        create: data.translations
      },
      tags: data.tagIds ? {
        create: data.tagIds.map(tagId => ({ tagId }))
      } : undefined,
      attachments: data.attachmentIds ? {
        create: data.attachmentIds.map(attachmentId => ({
          attachmentsId: attachmentId
          // Removed order field
        }))
      } : undefined
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mainImage: true, // Include main image
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      },
      attachments: {
        include: {
          attachment: true
        }
        // Removed orderBy since order field doesn't exist
      }
    }
  });

  return formatArticleResponse(article);
};

export const getArticles = async (lang: string, filters: ArticleFilters = {}, page = 1, limit = 10): Promise<ArticleListResponse> => {
  const skip = (page - 1) * limit;
  
  const where: any = {};
  
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: filters.tagIds
        }
      }
    };
  }
  
  if (filters.isPublished !== undefined) {
    where.isPublished = filters.isPublished;
  }
  
  if (filters.search) {
    where.translations = {
      some: {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { summary: { contains: filters.search, mode: 'insensitive' } },
          { body: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        translations: true,
        category: {
          include: {
            translations: true
          }
        },
        mainImage: true, // Include main image
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        },
        attachments: {
          include: {
            attachment: true
          }
          // Removed orderBy since order field doesn't exist
        }
      }
    }),
    prisma.article.count({ where })
  ]);

  return {
    articles: articles.map(article => formatArticleResponse(article, lang)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getArticleById = async (id: number, lang: string): Promise<ArticleResponse | null> => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mainImage: true, // Include main image
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      },
      attachments: {
        include: {
          attachment: true
        }
        // Removed orderBy since order field doesn't exist
      }
    }
  });

  if (!article) return null;

  // Increment view count
  await prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  return formatArticleResponse(article, lang);
};

export const getArticleBySlug = async (slug: string, lang: string): Promise<ArticleResponse | null> => {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mainImage: true, // Include main image
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      },
      attachments: {
        include: {
          attachment: true
        }
        // Removed orderBy since order field doesn't exist
      }
    }
  });

  if (!article) return null;

  // Increment view count
  await prisma.article.update({
    where: { slug },
    data: { views: { increment: 1 } }
  });

  return formatArticleResponse(article, lang);
};

export const updateArticle = async (id: number, data: UpdateArticleRequest): Promise<ArticleResponse | null> => {
  const existingArticle = await prisma.article.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingArticle) return null;

  // Validate category if provided
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    
    if (!categoryExists) {
      throw new Error(`Category with ID ${data.categoryId} does not exist`);
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

  // Validate main image if provided
  if (data.mainImageId) {
    const mainImageExists = await prisma.attachments.findUnique({
      where: { id: data.mainImageId }
    });
    
    if (!mainImageExists) {
      throw new Error(`Main image with ID ${data.mainImageId} does not exist`);
    }
  }

  let updateData: any = {};

  if (data.categoryId) {
    updateData.categoryId = data.categoryId;
  }

  if (data.mainImageId !== undefined) {
    updateData.mainImageId = data.mainImageId;
  }

  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }

  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished;
  }

  // Handle slug update if title changed
  if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    const currentDefaultTranslation = existingArticle.translations.find(t => t.isDefault);
    
    if (currentDefaultTranslation && defaultTranslation.title !== currentDefaultTranslation.title) {
      // Generate new unique slug
      const baseSlug = generateSlug(defaultTranslation.title);
      
      // Get all existing article slugs except the current one
      const existingArticles = await prisma.article.findMany({
        select: { slug: true },
        where: { id: { not: id } }
      });
      const existingSlugs = existingArticles.map(article => article.slug);
      
      // Generate unique slug
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      updateData.slug = uniqueSlug;
    }

    updateData.translations = {
      deleteMany: {},
      create: data.translations
    };
  }

  // Handle tags update
  if (data.tagIds !== undefined) {
    updateData.tags = {
      deleteMany: {},
      create: data.tagIds.map(tagId => ({ tagId }))
    };
  }

  // Handle attachments update
  if (data.attachmentIds !== undefined) {
    updateData.attachments = {
      deleteMany: {},
      create: data.attachmentIds.map(attachmentId => ({
        attachmentsId: attachmentId
        // Removed order field
      }))
    };
  }

  const updatedArticle = await prisma.article.update({
    where: { id },
    data: updateData,
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      mainImage: true, // Include main image
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      },
      attachments: {
        include: {
          attachment: true
        }
        // Removed orderBy since order field doesn't exist
      }
    }
  });

  return formatArticleResponse(updatedArticle);
};

export const deleteArticle = async (id: number): Promise<boolean> => {
  try {
    await prisma.article.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
};

const formatArticleResponse = (article: any, lang?: string): ArticleResponse => {
  const translation = lang 
    ? article.translations.find((t: any) => t.languageCode === lang) || article.translations.find((t: any) => t.isDefault)
    : article.translations.find((t: any) => t.isDefault);

  return {
    id: article.id,
    slug: article.slug,
    views: article.views,
    publishedAt: article.publishedAt,
    isPublished: article.isPublished,
    categoryId: article.categoryId,
    mainImageId: article.mainImageId, // Add main image ID
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    title: translation?.title || '',
    summary: translation?.summary,
    body: translation?.body || '',
    category: article.category ? {
      id: article.category.id,
      slug: article.category.slug,
      name: getCategoryName(article.category, lang)
    } : undefined,
    mainImage: article.mainImage ? {
      id: article.mainImage.id,
      originalName: article.mainImage.originalName,
      fileName: article.mainImage.fileName,
      path: article.mainImage.path,
      mimeType: article.mainImage.mimeType,
      size: article.mainImage.size,
      altText: article.mainImage.altText
    } : undefined,
    tags: article.tags?.map((articleTag: any) => ({
      id: articleTag.tag.id,
      slug: articleTag.tag.slug,
      name: getTagName(articleTag.tag, lang)
    })),
    attachments: article.attachments?.map((articleAttachment: any) => ({
      id: articleAttachment.attachment.id,
      originalName: articleAttachment.attachment.originalName,
      fileName: articleAttachment.attachment.fileName,
      path: articleAttachment.attachment.path,
      mimeType: articleAttachment.attachment.mimeType,
      size: articleAttachment.attachment.size,
      altText: articleAttachment.attachment.altText
      // Removed order field
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