import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))
  const search = searchParams.get("search") || ""
  const role = searchParams.get("role") || ""
  const status = searchParams.get("status") || ""
  const type = searchParams.get("type") || ""
  const sort = searchParams.get("sort") || "createdAt"
  const order = searchParams.get("order") === "asc" ? "asc" : "desc"

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ]
  }

  if (role && ["USER", "MODERATOR", "ADMIN"].includes(role)) where.role = role
  if (status && ["ACTIVE", "BANNED", "DELETED"].includes(status)) where.status = status
  if (type && ["CANDIDATE", "RECRUITER"].includes(type)) where.type = type

  const orderBy: Record<string, string> = {}
  if (["createdAt", "lastLoginAt", "email", "name"].includes(sort)) {
    orderBy[sort] = order
  } else {
    orderBy.createdAt = "desc"
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  })
}
