import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getViewerKeyFromRequest, utcDayString } from "@/lib/viewer-key"

export const dynamic = "force-dynamic"

/** Count at most one view per visitor per UTC day per job. */
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
    await prisma.jobUniqueDailyView.create({
      data: { jobId: job.id, day, viewerKey },
    })
    await prisma.job.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    })
    return NextResponse.json({ counted: true })
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === "P2002") {
      return NextResponse.json({ counted: false })
    }
    console.error("job view POST:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
