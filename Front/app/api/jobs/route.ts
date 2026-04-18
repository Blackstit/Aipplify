import { NextResponse } from "next/server"
import { getJobsWithFilters } from "@/lib/jobs"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 200)
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "date_desc"

    const workTypeParam = searchParams.get("workType")
    const workType = workTypeParam ? workTypeParam.split(",").filter(Boolean) : undefined

    const experienceParam = searchParams.get("experience")
    const experience = experienceParam ? experienceParam.split(",").filter(Boolean) : undefined

    const tagsParam = searchParams.get("tags")
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined

    const salaryMinRaw = searchParams.get("salary_min")
    const salaryMin = salaryMinRaw ? parseInt(salaryMinRaw, 10) : undefined

    const result = await getJobsWithFilters({
      page,
      limit,
      search,
      sort,
      workType,
      experience,
      tags,
      salaryMin: Number.isFinite(salaryMin) ? salaryMin : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
