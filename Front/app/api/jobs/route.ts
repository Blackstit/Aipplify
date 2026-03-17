import { NextResponse } from "next/server"
import { getJobsWithFilters } from "@/lib/jobs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const featured = searchParams.get("featured")
    const verified = searchParams.get("verified")
    const workType = searchParams.get("workType")?.split(",").filter(Boolean)
    const experience = searchParams.get("experience")?.split(",").filter(Boolean)
    const tags = searchParams.get("tags")?.split(",").filter(Boolean)

    const result = await getJobsWithFilters({
      page,
      limit,
      search: search || undefined,
      featured: featured === "true" ? true : featured === "false" ? false : undefined,
      verified: verified === "true" ? true : verified === "false" ? false : undefined,
      workType,
      experience,
      tags,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
