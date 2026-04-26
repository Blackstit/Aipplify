import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const FREE_LIMIT = 3

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const [subscription, used] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId }, select: { plan: true, status: true } }),
    prisma.matchCheckLog.count({ where: { userId } }),
  ])

  const hasUnlimited =
    subscription?.status === "ACTIVE" &&
    subscription?.plan !== "FREE"

  return NextResponse.json({
    used,
    limit: FREE_LIMIT,
    hasUnlimited,
    remaining: hasUnlimited ? Infinity : Math.max(0, FREE_LIMIT - used),
  })
}
