// src/services/article.service.ts
import { prisma } from "../database/prisma";
import { 
  CreateArticleRequest, 
  UpdateArticleRequest, 
  GetArticlesQuery,
  ArticleResponse 
} from "../types/article.types";
import { generateSlug, generateUniqueSlug, isValidSlug } from "../utils/slug.utils";

export async function createArticle(data: CreateArticleRequest): Promise<ArticleResponse> {
  // Check if category exists
  const category = await prisma.articleCategory.findUnique({
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
    // Use the default translation title to generate slug
    const defaultTranslation = defaultTranslations[0];
    slug = generateSlug(defaultTranslation.title);
  } else {
    // Validate provided slug
    if (!isValidSlug(slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
  }

  // Ensure slug is unique
  const existingArticles = await prisma.article.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingArticles.map(article => article.slug);
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

  const article = await prisma.article.create({
    data: {
      slug: uniqueSlug,
      categoryId: data.categoryId,
      date: new Date(data.date),
      views: 0,
      translations: {
        create: data.translations.map(translation => ({
          languageCode: translation.languageCode,
          isDefault: translation.isDefault,
          title: translation.title,
          summary: translation.summary,
          body: translation.body
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

  return formatArticleResponse(article);
}

export async function getArticleById(id: number, languageCode?: string): Promise<ArticleResponse | null> {
  const article = await prisma.article.findUnique({
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

  if (!article) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && article.translations.length === 0) {
    const articleWithDefault = await prisma.article.findUnique({
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
    return articleWithDefault ? formatArticleResponse(articleWithDefault) : null;
  }

  return formatArticleResponse(article);
}

export async function getArticleBySlug(slug: string, languageCode?: string): Promise<ArticleResponse | null> {
  const article = await prisma.article.findFirst({
    where: { slug },
    include: {
      category: true,
      translations: {
        where: languageCode ? { languageCode } : {},
        include: {
          language: true
        }
      }
    }
  });

  if (!article) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && article.translations.length === 0) {
    const articleWithDefault = await prisma.article.findFirst({
      where: { slug },
      include: {
        category: true,
        translations: {
          where: { isDefault: true },
          include: {
            language: true
          }
        }
      }
    });
    return articleWithDefault ? formatArticleResponse(articleWithDefault) : null;
  }

  // Increment views
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } }
  });

  return formatArticleResponse(article);
}

export async function getArticles(query: GetArticlesQuery = {}) {
  const { page = 1, limit = 10, categoryId, languageCode, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search || languageCode) {
    where.translations = {
      some: {
        ...(languageCode && { languageCode }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
            { body: { contains: search, mode: 'insensitive' } }
          ]
        })
      }
    };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.article.count({ where })
  ]);

  return {
    articles: articles.map(formatArticleResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateArticle(id: number, data: UpdateArticleRequest): Promise<ArticleResponse> {
  const existingArticle = await prisma.article.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingArticle) {
    throw new Error("ARTICLE_NOT_FOUND");
  }

  // Handle slug update
  let slugToUpdate = data.slug;
  
  if (data.slug) {
    // If slug is provided, validate it
    if (!isValidSlug(data.slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
    
    // Check slug uniqueness if updating slug
    if (data.slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findFirst({
        where: { slug: data.slug, id: { not: id } }
      });
      if (slugExists) {
        // Generate unique slug
        const existingArticles = await prisma.article.findMany({
          where: { id: { not: id } },
          select: { slug: true }
        });
        const existingSlugs = existingArticles.map(article => article.slug);
        slugToUpdate = generateUniqueSlug(data.slug, existingSlugs);
      }
    }
  } else if (data.translations) {
    // If translations are being updated but no slug provided, regenerate from default title
    const defaultTranslation = data.translations.find(t => t.isDefault);
    if (defaultTranslation) {
      const newSlug = generateSlug(defaultTranslation.title);
      const existingArticles = await prisma.article.findMany({
        where: { id: { not: id } },
        select: { slug: true }
      });
      const existingSlugs = existingArticles.map(article => article.slug);
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

  const updateData: any = {};
  
  if (slugToUpdate) updateData.slug = slugToUpdate;
  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.date) updateData.date = new Date(data.date);

  const article = await prisma.article.update({
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
    // Delete existing translations and create new ones
    await prisma.articleTranslation.deleteMany({
      where: { articleId: id }
    });

    await prisma.articleTranslation.createMany({
      data: data.translations.map(translation => ({
        articleId: id,
        languageCode: translation.languageCode,
        isDefault: translation.isDefault || false,
        title: translation.title,
        summary: translation.summary,
        body: translation.body
      }))
    });
  }

  // Update attachments if provided
  if (data.attachments !== undefined) {
    // Delete existing attachments
    await prisma.articleAttachments.deleteMany({
      where: { articleId: id }
    });

    // Add new attachments if any
    if (data.attachments.length > 0) {
      await prisma.articleAttachments.createMany({
        data: data.attachments.map(attachment => ({
          articleId: id,
          attachmentsId: attachment.attachmentId,
          type: attachment.type,
          order: attachment.order
        }))
      });
    }
  }

  // Fetch updated article with all relations
  const updatedArticle = await prisma.article.findUnique({
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

  return formatArticleResponse(updatedArticle!);
}

export async function deleteArticle(id: number): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id }
  });

  if (!article) {
    throw new Error("ARTICLE_NOT_FOUND");
  }

  // Delete related records first to avoid foreign key constraint violations
  await prisma.articleTranslation.deleteMany({
    where: { articleId: id }
  });

  await prisma.articleAttachments.deleteMany({
    where: { articleId: id }
  });

  // Now delete the article itself
  await prisma.article.delete({
    where: { id }
  });
}

function formatArticleResponse(article: any): ArticleResponse {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://api.example.com' 
    : `http://localhost:${process.env.PORT || 8000}`;

  return {
    id: article.id,
    slug: article.slug,
    views: article.views,
    date: article.date.toISOString(),
    categoryId: article.categoryId,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    category: article.category,
    translations: article.translations.map((translation: any) => ({
      id: translation.id,
      articleId: translation.articleId,
      languageCode: translation.languageCode,
      isDefault: translation.isDefault,
      title: translation.title,
      summary: translation.summary,
      body: translation.body,
      language: translation.language
    })),
    attachments: article.attachments ? article.attachments.map((item: any) => ({
      id: item.id,
      articleId: item.articleId,
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