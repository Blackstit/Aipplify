import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getViewerKeyFromRequest } from "@/lib/viewer-key"

export const dynamic = "force-dynamic"

const STALE_MS = 10 * 60 * 1000

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const viewerKey = getViewerKeyFromRequest(request)
  if (!viewerKey) {
    return NextResponse.json({ error: "Missing viewer identity" }, { status: 400 })
  }

  const job = await prisma.job.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { id: true },
  })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const now = new Date()
  const staleBefore = new Date(now.getTime() - STALE_MS)

  try {
    await prisma.$transaction([
      prisma.jobPresence.upsert({
        where: { jobId_viewerKey: { jobId: job.id, viewerKey } },
        create: { jobId: job.id, viewerKey, lastPingAt: now },
        update: { lastPingAt: now },
      }),
      prisma.jobPresence.deleteMany({
        where: { jobId: job.id, lastPingAt: { lt: staleBefore } },
      }),
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("job presence POST:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
