import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Facets aggregated from the local cache of jobs. Cheaper than the upstream job-eco
 * facets endpoint and keeps the site independent of remote availability.
 */
export async function GET() {
  try {
    // Pull a lightweight projection; we aggregate on the app side for arrays.
    const published = await prisma.job.findMany({
      where: { status: "PUBLISHED" },
      select: {
        role: true,
        seniorityRaw: true,
        experience: true,
        countryCity: true,
        skills: true,
        domains: true,
      },
      take: 5000,
    })

    const bump = (map: Map<string, number>, key: string | null | undefined) => {
      const k = (key || "").trim()
      if (!k) return
      map.set(k, (map.get(k) || 0) + 1)
    }

    const skills = new Map<string, number>()
    const roles = new Map<string, number>()
    const seniority = new Map<string, number>()
    const countries = new Map<string, number>()
    const domains = new Map<string, number>()

    for (const row of published) {
      for (const s of row.skills || []) bump(skills, s)
      bump(roles, row.role)
      bump(seniority, row.seniorityRaw || row.experience)
      // countryCity is "City, Country" or similar; split on comma and take last non-empty.
      if (row.countryCity) {
        const parts = row.countryCity.split(",").map((p) => p.trim()).filter(Boolean)
        if (parts.length > 0) bump(countries, parts[parts.length - 1])
      }
      for (const d of row.domains || []) bump(domains, d)
    }

    const top = (m: Map<string, number>, limit: number) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }))

    return NextResponse.json({
      skills: top(skills, 50),
      roles: top(roles, 30),
      countries: top(countries, 30),
      seniority: top(seniority, 10),
      domains: top(domains, 30),
    })
  } catch (error) {
    console.error("Error building facets:", error)
    return NextResponse.json(
      { error: "Failed to build facets", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
