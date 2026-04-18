import { NextResponse } from "next/server"
import { fetchSemanticSearch, vacancyToJobFrontend } from "@/lib/job-eco-api"
import { getJobsWithFilters } from "@/lib/jobs"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || searchParams.get("per_page") || "10")
    const perPage = Math.min(limit, 50)

    if (!q) return NextResponse.json({ jobs: [], total: 0, page: 1 })

    // Primary: live semantic search on job-eco (has embeddings we don't have locally).
    try {
      const params = new URLSearchParams()
      params.set("q", q)
      params.set("page", String(page))
      params.set("per_page", String(perPage))

      const data = await fetchSemanticSearch(params)
      const jobs = (data.items || []).map(vacancyToJobFrontend)
      return NextResponse.json({ jobs, total: data.total, page: data.page })
    } catch (err) {
      console.warn("Semantic search falling back to keyword search:", err)
    }

    // Fallback: plain keyword search against our cache so the UI always returns something.
    const fallback = await getJobsWithFilters({ page, limit: perPage, search: q })
    return NextResponse.json({ jobs: fallback.jobs, total: fallback.total, page: fallback.page })
  } catch (error) {
    console.error("Error in semantic search:", error)
    return NextResponse.json(
      { error: "Semantic search failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
