import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { config } from "dotenv";
config(); // loads .env.development or .env.production

async function main() {
  const prisma = new PrismaClient();
  // 1) ensure SUPER_ADMIN role exists
  const superRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Full access",
    },
  });

  // 2) create super admin user if not exists
  const username = process.env.SUPER_ADMIN_USERNAME!;
  const email    = process.env.SUPER_ADMIN_EMAIL!;
  const pwd      = process.env.SUPER_ADMIN_PASSWORD!;
  const hash     = await bcrypt.hash(pwd, 12);

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email,
      passwordHash: hash,
      roles: { create: { roleId: superRole.id } },
    },
  });

  console.log("✅ Seeded SUPER_ADMIN user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => PrismaClient.prototype.$disconnect());
