import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getViewerKeyFromRequest, utcDayString } from "@/lib/viewer-key"

export const dynamic = "force-dynamic"

/** Count at most one apply-button click per visitor per UTC day per job. */
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

  const day = utcDayString()

  try {
    await prisma.jobApplyClick.create({
      data: { jobId: job.id, day, viewerKey },
    })
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { applyCount: { increment: 1 } },
      select: { applyCount: true },
    })
    return NextResponse.json({ counted: true, applyCount: updated.applyCount })
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === "P2002") {
      const j = await prisma.job.findUnique({
        where: { id: job.id },
        select: { applyCount: true },
      })
      return NextResponse.json({ counted: false, applyCount: j?.applyCount ?? 0 })
    }
    console.error("apply-click POST:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
