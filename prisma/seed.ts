// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function main() {
	// 1) Define roles
	const roleNames = ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"]
	const roleMap: Record<string, number> = {}
	for (const name of roleNames) {
		const role = await prisma.role.upsert({
			where: { name },
			update: {},
			create: {
				name,
				description: name.replace(/_/g, " ").toLowerCase(),
			},
		})
		roleMap[name] = role.id
	}

	// 2) Define models and actions
	const models = [
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
	]
	const actions = ["CREATE", "READ", "UPDATE", "DELETE"]

	// 3) Generate and upsert permissions
	const permissionMap: Record<string, number> = {}
	for (const model of models) {
		for (const action of actions) {
			const name = `${action}_${model.toUpperCase()}`
			const description = `${action.toLowerCase()} ${model.toLowerCase()}`
			const perm = await prisma.permission.upsert({
				where: { name },
				update: {},
				create: { name, description },
			})
			permissionMap[name] = perm.id
		}
	}

	// 4) Assign all permissions to SUPER_ADMIN
	const superAdminId = roleMap["SUPER_ADMIN"]
	for (const permissionId of Object.values(permissionMap)) {
		await prisma.rolePermission.upsert({
			where: {
				roleId_permissionId: { roleId: superAdminId, permissionId },
			},
			update: {},
			create: { roleId: superAdminId, permissionId },
		})
	}

	// 5) Assign READ permissions to USER
	const userRoleId = roleMap["USER"]
	for (const [key, permissionId] of Object.entries(permissionMap)) {
		if (key.startsWith("READ_")) {
			await prisma.rolePermission.upsert({
				where: {
					roleId_permissionId: { roleId: userRoleId, permissionId },
				},
				update: {},
				create: { roleId: userRoleId, permissionId },
			})
		}
	}

	// 6) Seed SUPER_ADMIN user
	const username = process.env.SUPER_ADMIN_USERNAME
	const email = process.env.SUPER_ADMIN_EMAIL
	const password = process.env.SUPER_ADMIN_PASSWORD
	if (!username || !email || !password) {
		console.error("❌ Missing SUPER_ADMIN_* env vars!")
		process.exit(1)
	}
	const passwordHash = await bcrypt.hash(password, 12)
	await prisma.user.upsert({
		where: { username },
		update: { passwordHash, email },
		create: {
			username,
			email,
			passwordHash,
			roles: { create: { roleId: superAdminId } },
		},
	})

	console.log("✅ Seed complete: roles, permissions, and SUPER_ADMIN user.")
}

main()
	.catch((e) => {
		console.error("Seeder error:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
