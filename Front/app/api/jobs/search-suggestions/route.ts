import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchTerm = query.toLowerCase()

    // Get job titles and company names
    const [jobTitles, companies] = await Promise.all([
      prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          title: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        select: {
          title: true,
        },
        distinct: ["title"],
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.company.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        select: {
          name: true,
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ])

    const suggestions = [
      ...jobTitles.map((job) => ({
        type: "job" as const,
        text: job.title,
      })),
      ...companies.map((company) => ({
        type: "company" as const,
        text: company.name,
      })),
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
