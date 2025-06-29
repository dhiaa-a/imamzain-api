// src/services/attachment.service.ts
import { prisma } from "../database/prisma";
import { 
  CreateAttachmentRequest, 
  UpdateAttachmentRequest, 
  GetAttachmentsQuery,
  AttachmentResponse
} from "../types/attachment.types";
import fs from "fs";
import path from "path";

export async function createAttachment(data: CreateAttachmentRequest): Promise<AttachmentResponse> {
  const attachment = await prisma.attachments.create({
    data: {
      originalName: data.originalName,
      fileName: data.fileName,
      path: data.path,
      mimeType: data.mimeType,
      size: data.size,
      disk: data.disk || 'local',
      collection: data.collection || null,
      altText: data.altText || null,
      metadata: data.metadata || {}
    }
  });

  return formatAttachmentResponse(attachment);
}

export async function getAttachmentById(id: number): Promise<AttachmentResponse | null> {
  const attachment = await prisma.attachments.findUnique({
    where: { id }
  });

  if (!attachment) {
    return null;
  }

  return formatAttachmentResponse(attachment);
}

export async function getAttachments(query: GetAttachmentsQuery = {}) {
  const { page = 1, limit = 20, mimeType, collection, search, disk } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (mimeType) {
    where.mimeType = { contains: mimeType };
  }
  
  if (collection) {
    where.collection = collection;
  }
  
  if (disk) {
    where.disk = disk;
  }
  
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: 'insensitive' } },
      { fileName: { contains: search, mode: 'insensitive' } },
      { altText: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [attachments, total] = await Promise.all([
    prisma.attachments.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.attachments.count({ where })
  ]);

  return {
    attachments: attachments.map(formatAttachmentResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateAttachment(id: number, data: UpdateAttachmentRequest): Promise<AttachmentResponse> {
  const existingAttachment = await prisma.attachments.findUnique({
    where: { id }
  });

  if (!existingAttachment) {
    throw new Error("ATTACHMENT_NOT_FOUND");
  }

  const attachment = await prisma.attachments.update({
    where: { id },
    data: {
      ...(data.originalName && { originalName: data.originalName }),
      ...(data.fileName && { fileName: data.fileName }),
      ...(data.path && { path: data.path }),
      ...(data.mimeType && { mimeType: data.mimeType }),
      ...(data.size !== undefined && { size: data.size }),
      ...(data.disk && { disk: data.disk }),
      ...(data.collection !== undefined && { collection: data.collection }),
      ...(data.altText !== undefined && { altText: data.altText }),
      ...(data.metadata !== undefined && { metadata: data.metadata })
    }
  });

  return formatAttachmentResponse(attachment);
}

export async function deleteAttachment(id: number): Promise<void> {
  const attachment = await prisma.attachments.findUnique({
    where: { id }
  });

  if (!attachment) {
    throw new Error("ATTACHMENT_NOT_FOUND");
  }

  // Check if attachment is used in any articles
  const articleAttachments = await prisma.articleAttachments.findMany({
    where: { attachmentsId: id }
  });

  // Check if attachment is used in any research
  const researchAttachments = await prisma.researchAttachments.findMany({
    where: { attachmentsId: id }
  });

  // Check if attachment is used in any books
  const bookAttachments = await prisma.bookAttachments.findMany({
    where: { attachmentsId: id }
  });

  if (articleAttachments.length > 0 || researchAttachments.length > 0 || bookAttachments.length > 0) {
    throw new Error("ATTACHMENT_IN_USE");
  }

  // Delete physical file
  try {
    const fullPath = path.join(process.cwd(), 'uploads', attachment.path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.warn(`Failed to delete physical file: ${attachment.path}`, error);
  }

  // Delete from database
  await prisma.attachments.delete({
    where: { id }
  });
}

function formatAttachmentResponse(attachment: any): AttachmentResponse {
  return {
    id: attachment.id,
    originalName: attachment.originalName,
    fileName: attachment.fileName,
    path: attachment.path,
    mimeType: attachment.mimeType,
    size: attachment.size,
    disk: attachment.disk,
    collection: attachment.collection,
    altText: attachment.altText,
    metadata: attachment.metadata,
    createdAt: attachment.createdAt.toISOString(),
    updatedAt: attachment.updatedAt.toISOString(),
    url: `/uploads/${attachment.path}`
  };
}