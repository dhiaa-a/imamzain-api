/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Language" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "BookType" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BookType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "parts" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "pdf" TEXT NOT NULL,
    "part_number" INTEGER NOT NULL,
    "total_parts" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookTranslation" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "print_house" TEXT NOT NULL,
    "print_date" TEXT NOT NULL,
    "series" TEXT NOT NULL,

    CONSTRAINT "BookTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookTranslationName" (
    "id" SERIAL NOT NULL,
    "book_translation_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BookTranslationName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTranslationCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT,
    "name" TEXT,

    CONSTRAINT "ResearchTranslationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL,
    "pdf" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTranslation" (
    "id" SERIAL NOT NULL,
    "research_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,

    CONSTRAINT "ResearchTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTranslation" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "ArticleTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAttachment" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "ArticleAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BookType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookTranslation" ADD CONSTRAINT "BookTranslation_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookTranslation" ADD CONSTRAINT "BookTranslation_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookTranslationName" ADD CONSTRAINT "BookTranslationName_book_translation_id_fkey" FOREIGN KEY ("book_translation_id") REFERENCES "BookTranslation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ResearchTranslationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTranslation" ADD CONSTRAINT "ResearchTranslation_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "Research"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTranslation" ADD CONSTRAINT "ResearchTranslation_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ArticleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTranslation" ADD CONSTRAINT "ArticleTranslation_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTranslation" ADD CONSTRAINT "ArticleTranslation_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAttachment" ADD CONSTRAINT "ArticleAttachment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
