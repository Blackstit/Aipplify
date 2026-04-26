import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? undefined
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
  const offset = Number(searchParams.get("offset") ?? 0)

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.payment.count({ where: status ? { status: status as never } : undefined }),
  ])

  const summary = await prisma.payment.groupBy({
    by: ["status"],
    _count: true,
    _sum: { amount: true },
  })

  return NextResponse.json({ payments, total, summary })
}
