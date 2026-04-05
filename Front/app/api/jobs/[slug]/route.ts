import { NextResponse } from "next/server"
import { resolveVacancyBySlug } from "@/lib/resolve-job"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const result = await resolveVacancyBySlug(params.slug)

    if (!result) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if ("redirect" in result) {
      return NextResponse.json({ redirect: result.redirect }, { status: 301 })
    }

    return NextResponse.json(result.job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Failed to fetch job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
