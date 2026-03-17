import { NextResponse } from "next/server"
import { getSimilarJobs } from "@/lib/jobs"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "6")

    const similarJobs = await getSimilarJobs(params.slug, limit)

    return NextResponse.json({ jobs: similarJobs })
  } catch (error) {
    console.error("Error fetching similar jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
