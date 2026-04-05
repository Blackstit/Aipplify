import { NextResponse } from "next/server"
import { fetchLanding } from "@/lib/job-eco-api"
import { generateJobSlug } from "@/lib/slug"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchLanding()

    const recentJobs = (data.recent_jobs || []).map((j) => ({
      ...j,
      id: String(j.id),
      slug: generateJobSlug(j.id, j.title, j.company_name),
      company_name: j.company_name || "Unknown Company",
    }))

    return NextResponse.json({
      stats: data.stats,
      companies: data.companies,
      recent_jobs: recentJobs,
    })
  } catch (error) {
    console.error("Landing API error:", error)
    return NextResponse.json({
      stats: { total_vacancies: 800, total_companies: 300 },
      companies: [],
      recent_jobs: [],
    })
  }
}
