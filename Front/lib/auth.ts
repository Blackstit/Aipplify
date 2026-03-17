import { hash, compare } from "bcryptjs"
import { prisma } from "./prisma"
import type { User, UserType, UserRole } from "@prisma/client"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function createUniqueCompanySlug(name: string): Promise<string> {
  const base = slugify(name) || "company"
  let slug = base
  let i = 1
  // Ensure uniqueness
  while (await prisma.company.findUnique({ where: { slug } })) {
    i += 1
    slug = `${base}-${i}`
  }
  return slug
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  userType: UserType,
  companyName?: string
): Promise<User> {
  const hashedPassword = await hashPassword(password)

  const userData: any = {
    email,
    passwordHash: hashedPassword,
    name,
    type: userType,
    role: "USER" as UserRole,
    status: "ACTIVE",
  }

  const user = await prisma.user.create({
    data: userData,
  })

  // Если рекрутер — создаём компанию и привязываем к user через ownerUserId
  if (userType === "RECRUITER" && companyName) {
    const slug = await createUniqueCompanySlug(companyName)
    await prisma.company.create({
      data: {
        name: companyName,
        slug,
        ownerUserId: user.id,
      },
    })
  }

  return user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}
