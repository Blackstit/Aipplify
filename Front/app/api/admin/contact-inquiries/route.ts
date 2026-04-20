import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"
import type { ContactInquiryStatus, ContactInquirySource, Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

const STATUSES = new Set(["NEW", "READ", "RESPONDED", "CLOSED"])
const SOURCES = new Set(["CONTACT_PAGE", "RECRUITER_FORM", "RECRUITER_BANNER", "OTHER"])

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(request.url)
  const statusFilter = (url.searchParams.get("status") || "").toUpperCase()
  const sourceFilter = (url.searchParams.get("source") || "").toUpperCase()
  const search = (url.searchParams.get("search") || "").trim()
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "30", 10) || 30))

  const where: Prisma.ContactInquiryWhereInput = {}
  if (STATUSES.has(statusFilter)) where.status = statusFilter as ContactInquiryStatus
  if (SOURCES.has(sourceFilter)) where.source = sourceFilter as ContactInquirySource
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { contactValue: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ]
  }

  const [total, newCount, items] = await Promise.all([
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
    prisma.contactInquiry.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    total,
    newCount,
    page,
    limit,
    items,
  })
}
