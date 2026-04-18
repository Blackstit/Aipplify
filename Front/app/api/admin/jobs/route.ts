import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

const ALLOWED_SOURCES = new Set(["PARSED", "HR_ADDED", "COMPANY_ADDED", "SELF_POSTED", "JOB_ECO"])
const ALLOWED_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"])

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")))
  const search = (searchParams.get("search") || "").trim()
  const status = searchParams.get("status") || ""
  const source = searchParams.get("source") || ""
  const featured = searchParams.get("featured")
  const verified = searchParams.get("verified")
  const sort = searchParams.get("sort") || "postedAt"
  const order = searchParams.get("order") === "asc" ? "asc" : "desc"

  const where: Prisma.JobWhereInput = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { company: { name: { contains: search, mode: "insensitive" } } },
    ]
  }
  if (status && ALLOWED_STATUSES.has(status)) where.status = status as Prisma.JobWhereInput["status"]
  if (source && ALLOWED_SOURCES.has(source)) where.source = source as Prisma.JobWhereInput["source"]
  if (featured === "true") where.featured = true
  if (featured === "false") where.featured = false
  if (verified === "true") where.verified = true
  if (verified === "false") where.verified = false

  const sortField = [
    "postedAt", "createdAt", "updatedAt", "title", "aiScore", "lastSeenAt",
    "viewCount", "applyCount",
  ].includes(sort)
    ? sort
    : "postedAt"
  const orderBy: Prisma.JobOrderByWithRelationInput = { [sortField]: order } as Prisma.JobOrderByWithRelationInput

  const [jobs, total, published, archived, drafted, featuredCount, verifiedCount, lastSync] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        source: true,
        externalId: true,
        sourceUrl: true,
        featured: true,
        verified: true,
        aiScore: true,
        locationText: true,
        workType: true,
        experience: true,
        salaryText: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        countryCity: true,
        postedAt: true,
        createdAt: true,
        updatedAt: true,
        lastSeenAt: true,
        viewCount: true,
        applyCount: true,
        tags: true,
        company: { select: { id: true, name: true, slug: true, logoUrl: true, verified: true } },
      },
    }),
    prisma.job.count({ where }),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "ARCHIVED" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.job.count({ where: { featured: true } }),
    prisma.job.count({ where: { verified: true } }),
    prisma.job.aggregate({ _max: { lastSeenAt: true } }),
  ])

  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    stats: {
      published,
      archived,
      drafted,
      featured: featuredCount,
      verified: verifiedCount,
      lastSeenAt: lastSync._max.lastSeenAt,
    },
  })
}
