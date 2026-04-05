import { NextResponse } from "next/server"
import { fetchFacets } from "@/lib/job-eco-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const facets = await fetchFacets()
    return NextResponse.json(facets)
  } catch (error) {
    console.error("Error fetching facets:", error)
    return NextResponse.json(
      { error: "Failed to fetch facets", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
