import { prisma } from '../database/prisma';
import { generateSlug } from '../utils/slug.utils';
import { CreateTagRequest, UpdateTagRequest, TagResponse, TagsListResponse } from '../types/tag.types';

export const createTag = async (data: CreateTagRequest): Promise<TagResponse> => {
  // Always generate slug from the default translation name
  const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
  const slug = generateSlug(defaultTranslation.name);
  
  const tag = await prisma.tag.create({
    data: {
      slug,
      translations: {
        create: data.translations
      }
    },
    include: {
      translations: true
    }
  });

  return {
    id: tag.id,
    slug: tag.slug,
    name: tag.translations.find(t => t.isDefault)?.name || tag.translations[0].name,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
};

export const getTags = async (lang: string, page = 1, limit = 10, search?: string): Promise<TagsListResponse> => {
  const offset = (page - 1) * limit;
  
  const where = search ? {
    translations: {
      some: {
        languageCode: lang,
        name: {
          contains: search,
          mode: 'insensitive' as const
        }
      }
    }
  } : {
    translations: {
      some: {
        languageCode: lang
      }
    }
  };

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: {
        translations: {
          where: {
            languageCode: lang
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.tag.count({ where })
  ]);

  const tagResponses: TagResponse[] = tags.map(tag => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.translations[0]?.name || 'No translation',
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  }));

  return {
    tags: tagResponses,
    total,
    page,
    limit
  };
};

export const getTagById = async (id: number, lang: string): Promise<TagResponse | null> => {
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  if (!tag || tag.translations.length === 0) {
    return null;
  }

  return {
    id: tag.id,
    slug: tag.slug,
    name: tag.translations[0].name,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
};

export const updateTag = async (id: number, data: UpdateTagRequest): Promise<TagResponse | null> => {
  const existingTag = await prisma.tag.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingTag) {
    return null;
  }

  let updateData: any = {};
  
  // If translations are being updated, regenerate slug from new default translation
  if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    updateData.slug = generateSlug(defaultTranslation.name);
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: updateData,
    include: {
      translations: true
    }
  });

  if (data.translations) {
    // Delete existing translations
    await prisma.tagTranslation.deleteMany({
      where: { tagId: id }
    });

    // Create new translations
    await prisma.tagTranslation.createMany({
      data: data.translations.map(translation => ({
        ...translation,
        tagId: id
      }))
    });
  }

  const updatedTag = await prisma.tag.findUnique({
    where: { id },
    include: { translations: true }
  });

  return {
    id: updatedTag!.id,
    slug: updatedTag!.slug,
    name: updatedTag!.translations.find(t => t.isDefault)?.name || updatedTag!.translations[0]?.name || 'No translation',
    createdAt: updatedTag!.createdAt,
    updatedAt: updatedTag!.updatedAt
  };
};

export const deleteTag = async (id: number): Promise<boolean> => {
  try {
    await prisma.tag.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getTagBySlug = async (slug: string, lang: string): Promise<TagResponse | null> => {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      translations: {
        where: {
          languageCode: lang
        }
      }
    }
  });

  if (!tag || tag.translations.length === 0) {
    return null;
  }

  return {
    id: tag.id,
    slug: tag.slug,
    name: tag.translations[0].name,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
};