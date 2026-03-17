import { NextResponse } from "next/server"
import { getCompanyBySlugFromDB } from "@/lib/jobs"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await getCompanyBySlugFromDB(params.slug)

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Failed to fetch company", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
