import { NextResponse } from "next/server"
import { fetchVacancies, vacancyToJobFrontend } from "@/lib/job-eco-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 200)
    const search = searchParams.get("search") || ""

    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("per_page", String(limit))
    if (search) params.set("search", search)

    const workType = searchParams.get("workType")
    if (workType) {
      for (const wt of workType.split(",").filter(Boolean)) {
        params.set("location_type", wt.toLowerCase())
      }
    }

    const experience = searchParams.get("experience")
    if (experience) {
      const first = experience.split(",").filter(Boolean)[0]
      if (first) params.set("seniority", first.toLowerCase())
    }

    const salaryMin = searchParams.get("salary_min")
    if (salaryMin) params.set("salary_min_usd", salaryMin)

    const sort = searchParams.get("sort")
    if (sort) params.set("sort", sort)

    const data = await fetchVacancies(params)
    const jobs = (data.items || []).map(vacancyToJobFrontend)

    return NextResponse.json({
      jobs,
      total: data.total,
      page: data.page,
      limit: data.per_page,
      totalPages: Math.ceil(data.total / data.per_page),
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
