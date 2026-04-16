import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Paths we don't want to track
const SKIP_PREFIXES = ["/api/", "/_next/", "/admin", "/favicon"]

export async function POST(request: Request) {
  try {
    const { path } = await request.json()
    if (!path || typeof path !== "string") return NextResponse.json({ ok: false })

    // Skip admin, API, and static paths
    if (SKIP_PREFIXES.some((p) => path.startsWith(p))) {
      return NextResponse.json({ ok: false })
    }

    const day = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

    // Upsert: increment views for this path+day
    await prisma.dailyPageView.upsert({
      where: { path_day: { path, day } },
      create: { path, day, views: 1 },
      update: { views: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
