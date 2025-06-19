/*
  Warnings:

  - You are about to drop the column `date` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ArticleCategory` table. All the data in the column will be lost.
  - You are about to drop the column `printDate` on the `BookTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `printHouse` on the `BookTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Research` table. All the data in the column will be lost.
  - You are about to drop the `BookTranslationName` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchTranslationCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[articleId,languageCode]` on the table `ArticleTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookId,languageCode]` on the table `BookTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Research` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[researchId,languageCode]` on the table `ResearchTranslation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ArticleCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArticleAttachments" DROP CONSTRAINT "ArticleAttachments_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleTranslation" DROP CONSTRAINT "ArticleTranslation_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "BookAttachments" DROP CONSTRAINT "BookAttachments_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookTranslation" DROP CONSTRAINT "BookTranslation_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookTranslationName" DROP CONSTRAINT "BookTranslationName_bookTranslationId_fkey";

-- DropForeignKey
ALTER TABLE "Research" DROP CONSTRAINT "Research_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchAttachments" DROP CONSTRAINT "ResearchAttachments_researchId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchTranslation" DROP CONSTRAINT "ResearchTranslation_researchId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "date",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ALTER COLUMN "views" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ArticleAttachments" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "ArticleCategory" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ArticleTranslation" ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ALTER COLUMN "isDefault" SET DEFAULT false,
ALTER COLUMN "summary" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "publishYear" TEXT,
ALTER COLUMN "pages" DROP NOT NULL,
ALTER COLUMN "parts" DROP NOT NULL,
ALTER COLUMN "views" SET DEFAULT 0,
ALTER COLUMN "partNumber" DROP NOT NULL,
ALTER COLUMN "totalParts" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BookAttachments" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "BookTranslation" DROP COLUMN "printDate",
DROP COLUMN "printHouse",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "publisher" TEXT,
ALTER COLUMN "isDefault" SET DEFAULT false,
ALTER COLUMN "author" DROP NOT NULL,
ALTER COLUMN "series" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Research" DROP COLUMN "date",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" DATE,
ALTER COLUMN "views" SET DEFAULT 0,
ALTER COLUMN "pages" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ResearchAttachments" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "ResearchTranslation" ADD COLUMN     "authors" TEXT,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ALTER COLUMN "abstract" DROP NOT NULL,
ALTER COLUMN "isDefault" SET DEFAULT false;

-- DropTable
DROP TABLE "BookTranslationName";

-- DropTable
DROP TABLE "BookType";

-- DropTable
DROP TABLE "ResearchTranslationCategory";

-- CreateTable
CREATE TABLE "ResearchCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategoryTranslation" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "ArticleCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchCategoryTranslation" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "ResearchCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCategoryTranslation" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "BookCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchCategory_slug_key" ON "ResearchCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookCategory_slug_key" ON "BookCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategoryTranslation_categoryId_languageCode_key" ON "ArticleCategoryTranslation"("categoryId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchCategoryTranslation_categoryId_languageCode_key" ON "ResearchCategoryTranslation"("categoryId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "BookCategoryTranslation_categoryId_languageCode_key" ON "BookCategoryTranslation"("categoryId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleTranslation_articleId_languageCode_key" ON "ArticleTranslation"("articleId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookTranslation_bookId_languageCode_key" ON "BookTranslation"("bookId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "Research_slug_key" ON "Research"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchTranslation_researchId_languageCode_key" ON "ResearchTranslation"("researchId", "languageCode");

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTranslation" ADD CONSTRAINT "ArticleTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAttachments" ADD CONSTRAINT "ArticleAttachments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResearchCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCategory" ADD CONSTRAINT "ResearchCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ResearchCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTranslation" ADD CONSTRAINT "ResearchTranslation_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAttachments" ADD CONSTRAINT "ResearchAttachments_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BookCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BookCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookTranslation" ADD CONSTRAINT "BookTranslation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAttachments" ADD CONSTRAINT "BookAttachments_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategoryTranslation" ADD CONSTRAINT "ArticleCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategoryTranslation" ADD CONSTRAINT "ArticleCategoryTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCategoryTranslation" ADD CONSTRAINT "ResearchCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResearchCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCategoryTranslation" ADD CONSTRAINT "ResearchCategoryTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategoryTranslation" ADD CONSTRAINT "BookCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BookCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategoryTranslation" ADD CONSTRAINT "BookCategoryTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
