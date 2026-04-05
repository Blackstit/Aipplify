import { NextResponse } from "next/server"
import { fetchVacancies } from "@/lib/job-eco-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("per_page", "10")
    params.set("search", query)

    const data = await fetchVacancies(params)
    const items = data.items || []

    const titleSet = new Set<string>()
    const companySet = new Set<string>()
    const suggestions: { type: string; text: string }[] = []

    for (const item of items) {
      if (titleSet.size < 5 && item.title && !titleSet.has(item.title)) {
        titleSet.add(item.title)
        suggestions.push({ type: "job", text: item.title })
      }
      const cn = item.company_name || item.company?.name
      if (cn && companySet.size < 3 && !companySet.has(cn)) {
        companySet.add(cn)
        suggestions.push({ type: "company", text: cn })
      }
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({ suggestions: [] })
  }
}
