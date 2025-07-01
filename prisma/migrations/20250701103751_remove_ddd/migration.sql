/*
  Warnings:

  - You are about to drop the column `description` on the `ArticleCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `ArticleCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `ArticleCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `BookCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `BookCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `BookCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ResearchCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `ResearchCategoryTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `ResearchCategoryTranslation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ArticleCategoryTranslation" DROP COLUMN "description",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle";

-- AlterTable
ALTER TABLE "BookCategoryTranslation" DROP COLUMN "description",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle";

-- AlterTable
ALTER TABLE "ResearchCategoryTranslation" DROP COLUMN "description",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle";
