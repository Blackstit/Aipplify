import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { getAdminFromRequest } from "@/lib/adminGuard"

export const dynamic = "force-dynamic"

const WATCHING_WINDOW_MS = 45_000

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const job = await prisma.job.findFirst({
      where: { slug: params.slug, status: "PUBLISHED" },
      select: { id: true, viewCount: true, applyCount: true },
    })
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const since = new Date(Date.now() - WATCHING_WINDOW_MS)
    const watching = await prisma.jobPresence.count({
      where: { jobId: job.id, lastPingAt: { gte: since } },
    })

    const staff = await getAdminFromRequest(request)
    const isStaff = Boolean(staff)

    const settings = await getSiteSettings()
    const showCounts = isStaff || settings.showPublicJobViewCounts
    const showWatching = isStaff || settings.showPublicWatchingCount

    return NextResponse.json({
      viewCount: showCounts ? job.viewCount : null,
      applyCount: showCounts ? job.applyCount : null,
      watching: showWatching ? watching : null,
      flags: {
        showPublicJobViewCounts: settings.showPublicJobViewCounts,
        showPublicWatchingCount: settings.showPublicWatchingCount,
      },
    })
  } catch (e) {
    console.error("live-metrics GET:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
