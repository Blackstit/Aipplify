import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"
import bcrypt from "bcryptjs"
import { z } from "zod"

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  type: true,
  role: true,
  status: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  _count: { select: { applications: true, sessions: true } },
}

/**
 * Load visitor activity attached to this user (via `Visitor.userId`), plus their
 * latest page views. We also pull the most recent authenticated Session to surface
 * the last known IP / UA even for users with no Visitor rows yet.
 */
async function loadUserActivity(userId: string) {
  const visitors = await prisma.visitor.findMany({
    where: { userId },
    orderBy: { lastSeen: "desc" },
    take: 10,
    select: {
      id: true,
      firstSeen: true,
      lastSeen: true,
      pageViews: true,
      firstPath: true,
      firstReferrer: true,
      userAgent: true,
      ip: true,
      country: true,
    },
  })

  const visitorIds = visitors.map((v) => v.id)

  // Recent individual page views, up to 30 across all this user's visitor cookies.
  const pageViews = visitorIds.length
    ? await prisma.pageView.findMany({
        where: { visitorId: { in: visitorIds } },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          visitorId: true,
          path: true,
          referrer: true,
          createdAt: true,
        },
      })
    : []

  // Last session gives us the last-known login IP/UA even if the visitor
  // cookie was cleared.
  const lastSession = await prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, ip: true, userAgent: true, revokedAt: true, expiresAt: true },
  })

  return {
    visitors: visitors.map((v) => ({
      ...v,
      firstSeen: v.firstSeen.toISOString(),
      lastSeen: v.lastSeen.toISOString(),
    })),
    pageViews: pageViews.map((pv) => ({
      ...pv,
      createdAt: pv.createdAt.toISOString(),
    })),
    lastSession: lastSession
      ? {
          ...lastSession,
          createdAt: lastSession.createdAt.toISOString(),
          expiresAt: lastSession.expiresAt.toISOString(),
          revokedAt: lastSession.revokedAt?.toISOString() ?? null,
        }
      : null,
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: params.id }, select: USER_SELECT })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const activity = await loadUserActivity(params.id)

  return NextResponse.json({ ...user, activity })
}

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").optional(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BANNED", "DELETED"]).optional(),
  type: z.enum(["CANDIDATE", "RECRUITER"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  emailVerified: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    // Only ADMIN can grant ADMIN role
    if (data.role === "ADMIN" && admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can grant ADMIN role" }, { status: 403 })
    }

    // Can't edit another admin unless you're admin yourself
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    })
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (target.role === "ADMIN" && admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can edit other admins" }, { status: 403 })
    }

    // Check email uniqueness
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: params.id } },
      })
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.email !== undefined) update.email = data.email
    if (data.role !== undefined) update.role = data.role
    if (data.status !== undefined) update.status = data.status
    if (data.type !== undefined) update.type = data.type
    if (data.password) update.passwordHash = await bcrypt.hash(data.password, 12)
    if (data.emailVerified !== undefined) {
      update.emailVerified = data.emailVerified ? new Date() : null
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: update,
      select: USER_SELECT,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 })
    }
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
