import { NextResponse } from "next/server"
import { getJobBySlugFromDB } from "@/lib/jobs"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const job = await getJobBySlugFromDB(params.slug)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Failed to fetch job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
