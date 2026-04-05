import { NextResponse } from "next/server"
import { fetchSemanticSearch, vacancyToJobFrontend } from "@/lib/job-eco-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || searchParams.get("per_page") || "10")
    const perPage = Math.min(limit, 50)

    if (!q.trim()) {
      return NextResponse.json({ jobs: [], total: 0, page: 1 })
    }

    const params = new URLSearchParams()
    params.set("q", q)
    params.set("page", String(page))
    params.set("per_page", String(perPage))

    const data = await fetchSemanticSearch(params)
    const jobs = (data.items || []).map(vacancyToJobFrontend)

    return NextResponse.json({
      jobs,
      total: data.total,
      page: data.page,
    })
  } catch (error) {
    console.error("Error in semantic search:", error)
    return NextResponse.json(
      { error: "Semantic search failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
