// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config(); // load .env

const prisma = new PrismaClient();

async function main() {
  // 1) Define roles
  const roleNames = ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"];
  const roleMap: Record<string, number> = {};
<<<<<<< HEAD
  
=======
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: name.replace(/_/g, " ").toLowerCase() },
    });
    roleMap[name] = role.id;
  }

<<<<<<< HEAD
  // 2) Define models and actions based on updated schema
  const models = [
    // Auth & ACL Models
=======
  // 2) Define models and actions
  const models = [
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    "User",
    "UserProfile",
    "ActivityLog",
    "Role",
    "Permission",
    "UserRole",
    "Group",
    "GroupMember",
    "RolePermission",
    "GroupPermission",
<<<<<<< HEAD
    "RefreshToken",
    
    // Language System
    "Language",
    
    // Attachments System
    "Attachments",
    
    // Article System
    "Article",
    "ArticleCategory",
    "ArticleTranslation",
    "ArticleAttachments",
    "ArticleCategoryTranslation",
    
    // Research System
    "Research",
    "ResearchCategory",
    "ResearchTranslation",
    "ResearchAttachments",
    "ResearchCategoryTranslation",
    
    // Book System
    "Book",
    "BookCategory",
    "BookTranslation",
    "BookAttachments",
    "BookCategoryTranslation",
  ];

=======
    "Language",
    "BookType",
    "Book",
    "BookTranslation",
    "BookTranslationName",
    "ResearchTranslationCategory",
    "Research",
    "ResearchTranslation",
    "ArticleCategory",
    "Article",
    "ArticleTranslation",
    "ArticleAttachment",
    "RefreshToken",
  ];
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  const actions = ["CREATE", "READ", "UPDATE", "DELETE"];

  // 3) Generate and upsert permissions
  const permissionMap: Record<string, number> = {};
<<<<<<< HEAD
  
=======
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  for (const model of models) {
    for (const action of actions) {
      const name = `${action}_${model.toUpperCase()}`;
      const description = `${action.toLowerCase()} ${model.toLowerCase()}`;
<<<<<<< HEAD
      
=======
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
      const perm = await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name, description },
      });
      permissionMap[name] = perm.id;
    }
  }

  // 4) Assign all permissions to SUPER_ADMIN
  const superAdminId = roleMap["SUPER_ADMIN"];
<<<<<<< HEAD
  
=======
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  for (const permissionId of Object.values(permissionMap)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminId, permissionId } },
      update: {},
      create: { roleId: superAdminId, permissionId },
    });
  }

<<<<<<< HEAD
  // 5) Assign specific permissions to ADMIN (all except user management)
  const adminId = roleMap["ADMIN"];
  const adminExcludedModels = ["User", "Role", "Permission", "UserRole", "Group", "GroupMember", "RolePermission", "GroupPermission"];
  
  for (const [key, permissionId] of Object.entries(permissionMap)) {
    const isExcluded = adminExcludedModels.some(model => 
      key.includes(`_${model.toUpperCase()}`)
    );
    
    if (!isExcluded) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminId, permissionId } },
        update: {},
        create: { roleId: adminId, permissionId },
      });
    }
  }

  // 6) Assign content permissions to EDITOR
  const editorId = roleMap["EDITOR"];
  const editorModels = [
    "Article", "ArticleCategory", "ArticleTranslation", "ArticleAttachments", "ArticleCategoryTranslation",
    "Research", "ResearchCategory", "ResearchTranslation", "ResearchAttachments", "ResearchCategoryTranslation",
    "Book", "BookCategory", "BookTranslation", "BookAttachments", "BookCategoryTranslation",
    "Attachments", "Language"
  ];
  
  for (const [key, permissionId] of Object.entries(permissionMap)) {
    const isEditorModel = editorModels.some(model => 
      key.includes(`_${model.toUpperCase()}`)
    );
    
    if (isEditorModel) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorId, permissionId } },
        update: {},
        create: { roleId: editorId, permissionId },
      });
    }
  }

  // 7) Assign READ permissions to USER
  const userRoleId = roleMap["USER"];
  
=======
  // 5) Assign READ permissions to USER
  const userRoleId = roleMap["USER"];
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  for (const [key, permissionId] of Object.entries(permissionMap)) {
    if (key.startsWith("READ_")) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: userRoleId, permissionId } },
        update: {},
        create: { roleId: userRoleId, permissionId },
      });
    }
  }

<<<<<<< HEAD
  // 8) Seed default languages
  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "fa", name: "Persian", nativeName: "فارسی" },
    { code: "ur", name: "Urdu", nativeName: "اردو" },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  // 9) Seed SUPER_ADMIN user
  const username = process.env.SUPER_ADMIN_USERNAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

=======
  // 6) Seed SUPER_ADMIN user
  const username = process.env.SUPER_ADMIN_USERNAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  if (!username || !email || !password) {
    console.error("❌ Missing SUPER_ADMIN_* env vars!");
    process.exit(1);
  }
<<<<<<< HEAD

  const passwordHash = await bcrypt.hash(password, 12);
  
  const superAdminUser = await prisma.user.upsert({
=======
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    where: { username },
    update: { passwordHash, email },
    create: {
      username,
      email,
      passwordHash,
      roles: { create: { roleId: superAdminId } },
<<<<<<< HEAD
      profile: {
        create: {
          fullName: "Super Administrator",
          bio: "System Super Administrator"
        }
      }
    },
  });

  // 10) Seed sample categories
  const sampleCategories = [
    {
      type: "article",
      slug: "general",
      translations: [
        { languageCode: "en", name: "General", description: "General articles", isDefault: true },
        { languageCode: "ar", name: "عام", description: "مقالات عامة", isDefault: false }
      ]
    },
    {
      type: "research", 
      slug: "academic",
      translations: [
        { languageCode: "en", name: "Academic Research", description: "Academic research papers", isDefault: true },
        { languageCode: "ar", name: "البحوث الأكاديمية", description: "الأوراق البحثية الأكاديمية", isDefault: false }
      ]
    },
    {
      type: "book",
      slug: "religious",
      translations: [
        { languageCode: "en", name: "Religious Books", description: "Religious and spiritual books", isDefault: true },
        { languageCode: "ar", name: "الكتب الدينية", description: "الكتب الدينية والروحية", isDefault: false }
      ]
    }
  ];

  for (const category of sampleCategories) {
    if (category.type === "article") {
      const articleCategory = await prisma.articleCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: { slug: category.slug },
      });

      for (const translation of category.translations) {
        await prisma.articleCategoryTranslation.upsert({
          where: { 
            categoryId_languageCode: { 
              categoryId: articleCategory.id, 
              languageCode: translation.languageCode 
            } 
          },
          update: {},
          create: {
            categoryId: articleCategory.id,
            languageCode: translation.languageCode,
            name: translation.name,
            description: translation.description,
            isDefault: translation.isDefault,
          },
        });
      }
    } else if (category.type === "research") {
      const researchCategory = await prisma.researchCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: { slug: category.slug },
      });

      for (const translation of category.translations) {
        await prisma.researchCategoryTranslation.upsert({
          where: { 
            categoryId_languageCode: { 
              categoryId: researchCategory.id, 
              languageCode: translation.languageCode 
            } 
          },
          update: {},
          create: {
            categoryId: researchCategory.id,
            languageCode: translation.languageCode,
            name: translation.name,
            description: translation.description,
            isDefault: translation.isDefault,
          },
        });
      }
    } else if (category.type === "book") {
      const bookCategory = await prisma.bookCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: { slug: category.slug },
      });

      for (const translation of category.translations) {
        await prisma.bookCategoryTranslation.upsert({
          where: { 
            categoryId_languageCode: { 
              categoryId: bookCategory.id, 
              languageCode: translation.languageCode 
            } 
          },
          update: {},
          create: {
            categoryId: bookCategory.id,
            languageCode: translation.languageCode,
            name: translation.name,
            description: translation.description,
            isDefault: translation.isDefault,
          },
        });
      }
    }
  }

  console.log("✅ Seed complete:");
  console.log("   - Roles and permissions created");
  console.log("   - Default languages added");
  console.log("   - SUPER_ADMIN user created");
  console.log("   - Sample categories with translations added");
=======
    },
  });

  console.log("✅ Seed complete: roles, permissions, and SUPER_ADMIN user.");
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
}

main()
  .catch((e) => {
    console.error("Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
<<<<<<< HEAD
  });
=======
  });
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
