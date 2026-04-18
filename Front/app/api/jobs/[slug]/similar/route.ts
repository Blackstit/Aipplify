import { NextResponse } from "next/server"
import { getSimilarJobs } from "@/lib/jobs"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params: routeParams }: { params: { slug: string } },
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "6")))
    const jobs = await getSimilarJobs(routeParams.slug, limit)
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching similar jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
