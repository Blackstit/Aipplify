import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizeLogoUrl } from "@/lib/jobs"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [totalJobs, totalCompanies, topCompanies, recentJobs] = await Promise.all([
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.company.count(),
      prisma.company.findMany({
        where: { jobs: { some: { status: "PUBLISHED" } } },
        select: {
          name: true,
          logoUrl: true,
          industry: true,
          _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
        },
        orderBy: { jobs: { _count: "desc" } },
        take: 12,
      }),
      prisma.job.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          externalId: true,
          title: true,
          salaryMin: true,
          salaryMax: true,
          locationType: true,
          aiScore: true,
          company: { select: { name: true } },
        },
        orderBy: [{ featured: "desc" }, { postedAt: "desc" }],
        take: 8,
      }),
    ])

    return NextResponse.json({
      stats: { total_vacancies: totalJobs, total_companies: totalCompanies },
      companies: topCompanies.map((c) => ({
        name: c.name,
        logo_url: normalizeLogoUrl(c.logoUrl),
        industry: c.industry,
        job_count: c._count.jobs,
      })),
      recent_jobs: recentJobs.map((j) => ({
        id: j.externalId ? String(j.externalId) : j.id,
        slug: j.slug,
        title: j.title,
        company_name: j.company?.name || "Unknown Company",
        salary_min: j.salaryMin,
        salary_max: j.salaryMax,
        location_type: j.locationType,
        ai_score: j.aiScore,
      })),
    })
  } catch (error) {
    console.error("Landing API error:", error)
    return NextResponse.json({
      stats: { total_vacancies: 0, total_companies: 0 },
      companies: [],
      recent_jobs: [],
    })
  }
}
