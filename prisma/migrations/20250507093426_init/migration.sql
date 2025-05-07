/*
  Warnings:

  - You are about to drop the column `category_id` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `part_number` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `total_parts` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookTranslationName` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Language` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchTranslationCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Research` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parts` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Research` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ArticleAttachment" DROP CONSTRAINT "ArticleAttachment_article_id_fkey";

-- DropForeignKey
ALTER TABLE "ArticleTranslation" DROP CONSTRAINT "ArticleTranslation_article_id_fkey";

-- DropForeignKey
ALTER TABLE "ArticleTranslation" DROP CONSTRAINT "ArticleTranslation_language_code_fkey";

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_category_id_fkey";

-- DropForeignKey
ALTER TABLE "BookTranslation" DROP CONSTRAINT "BookTranslation_book_id_fkey";

-- DropForeignKey
ALTER TABLE "BookTranslation" DROP CONSTRAINT "BookTranslation_language_code_fkey";

-- DropForeignKey
ALTER TABLE "BookTranslationName" DROP CONSTRAINT "BookTranslationName_book_translation_id_fkey";

-- DropForeignKey
ALTER TABLE "Research" DROP CONSTRAINT "Research_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ResearchTranslation" DROP CONSTRAINT "ResearchTranslation_language_code_fkey";

-- DropForeignKey
ALTER TABLE "ResearchTranslation" DROP CONSTRAINT "ResearchTranslation_research_id_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "part_number",
DROP COLUMN "total_parts",
DROP COLUMN "updated_at",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "otherNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "partNumber" INTEGER,
ADD COLUMN     "printDate" DATE,
ADD COLUMN     "printHouse" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalParts" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "views" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "pdf" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Research" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "date",
DROP COLUMN "updated_at",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "otherNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "parts" INTEGER NOT NULL,
ADD COLUMN     "printDate" DATE,
ADD COLUMN     "printHouse" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "views" SET DEFAULT 0,
ALTER COLUMN "pdf" DROP NOT NULL;

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "ArticleAttachment";

-- DropTable
DROP TABLE "ArticleCategory";

-- DropTable
DROP TABLE "ArticleTranslation";

-- DropTable
DROP TABLE "BookTranslation";

-- DropTable
DROP TABLE "BookTranslationName";

-- DropTable
DROP TABLE "BookType";

-- DropTable
DROP TABLE "Language";

-- DropTable
DROP TABLE "ResearchTranslation";

-- DropTable
DROP TABLE "ResearchTranslationCategory";

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "lastUpdate" TIMESTAMP(3),
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAttachment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "attachmentId" INTEGER NOT NULL,

    CONSTRAINT "PostAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sellpoint" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hours" TEXT NOT NULL,

    CONSTRAINT "Sellpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PostAttachment_postId_attachmentId_key" ON "PostAttachment"("postId", "attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryImage_galleryId_imageId_key" ON "GalleryImage"("galleryId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Research_slug_key" ON "Research"("slug");

-- AddForeignKey
ALTER TABLE "PostAttachment" ADD CONSTRAINT "PostAttachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAttachment" ADD CONSTRAINT "PostAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sellpoint" ADD CONSTRAINT "Sellpoint_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
