import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get("q") || "").trim()

    if (query.length < 2) return NextResponse.json({ suggestions: [] })

    const [jobs, companies] = await Promise.all([
      prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          title: { contains: query, mode: "insensitive" },
        },
        select: { title: true },
        distinct: ["title"],
        take: 6,
        orderBy: { postedAt: "desc" },
      }),
      prisma.company.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
          jobs: { some: { status: "PUBLISHED" } },
        },
        select: { name: true },
        distinct: ["name"],
        take: 4,
        orderBy: { name: "asc" },
      }),
    ])

    const suggestions: { type: string; text: string }[] = []
    for (const j of jobs) suggestions.push({ type: "job", text: j.title })
    for (const c of companies) suggestions.push({ type: "company", text: c.name })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({ suggestions: [] })
  }
}
