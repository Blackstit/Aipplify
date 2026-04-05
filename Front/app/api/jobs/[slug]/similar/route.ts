import { NextResponse } from "next/server"
import { fetchVacancies, vacancyToJobFrontend } from "@/lib/job-eco-api"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params: routeParams }: { params: { slug: string } },
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "6")

    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("per_page", String(limit))
    params.set("sort", "date_desc")

    const data = await fetchVacancies(params)
    const jobs = (data.items || [])
      .filter((item) => `job-eco-${item.id}` !== routeParams.slug)
      .slice(0, limit)
      .map(vacancyToJobFrontend)

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching similar jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
