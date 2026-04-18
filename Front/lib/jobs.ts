import { prisma } from "@/lib/prisma"
import type { Job, Company, Prisma } from "@prisma/client"

const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://aipplify.com"

export function normalizeLogoUrl(url: string | null | undefined): string | null {
  if (url == null || String(url).trim() === "") return null
  const u = String(url).trim()
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:")) return u
  if (u.startsWith("//")) return `https:${u}`
  const origin = SITE.replace(/\/$/, "")
  if (u.startsWith("/")) return `${origin}${u}`
  return u
}

// Rich frontend shape (kept compatible with the live job-eco mapper in lib/job-eco-api.ts).
export interface JobFrontend {
  id: string
  slug: string
  title: string
  company: {
    id: string
    name: string
    slug: string
    logo: string | null
    verified: boolean
  }
  salary: string
  location: string
  workType: "remote" | "hybrid" | "office"
  region: "global" | "europe" | "usa" | "asia"
  specialization: string
  experience: "intern" | "junior" | "mid" | "senior" | "lead"
  tags: string[]
  description: string
  requirements: string[]
  postedAt: string
  featured: boolean
  verified: boolean
  recruiterContact?: string | null
  sourceUrl?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  aiScore?: number | null
  scoring?: {
    total_score: number
    overall_summary: string
    red_flags: string[]
    scoring_results: { criterion: string; key: string; score: number; weight: number; summary: string }[]
  } | null
  companyInfo?: {
    name: string
    website: string | null
    logo_url: string | null
    industry: string | null
    size: string | null
    founded: string | null
    headquarters: string | null
    summary: string | null
    socials: Record<string, string> | null
    domains: string[] | null
  } | null
  countryCity?: string | null
  locationType?: string | null
  /** Total unique visitor-days counted (see JobUniqueDailyView). */
  viewCount?: number
  /** Successful “Apply” saves (Application rows). */
  applyCount?: number
}

function formatSalary(min: number | null, max: number | null, currency: string | null, fallbackText: string | null): string {
  const cur = currency || "USD"
  if (fallbackText && fallbackText.trim()) return fallbackText.trim()
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()} ${cur}`
  if (max != null) return `Up to $${max.toLocaleString()} ${cur}`
  if (min != null) return `From $${min.toLocaleString()} ${cur}`
  return "Not specified"
}

type JobWithCompany = Job & { company: Company | null }

export function transformJob(job: JobWithCompany): JobFrontend {
  const wt = job.workType.toLowerCase() as "remote" | "hybrid" | "office"
  const company = job.company
  const companyName = company?.name || "Unknown Company"
  const locationText =
    job.locationText && job.locationText.trim()
      ? job.locationText
      : (job.countryCity && job.countryCity.trim())
        ? job.countryCity
        : wt === "remote" ? "Remote" : wt === "hybrid" ? "Hybrid" : "Office / on-site"

  // Extract scoring JSON safely.
  const scoringJson = (job.scoring as unknown) as JobFrontend["scoring"] | null
  const socialsJson = (company?.socials as unknown) as Record<string, string> | null

  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: {
      id: company?.id || "",
      name: companyName,
      slug: company?.slug || "",
      logo: normalizeLogoUrl(company?.logoUrl),
      verified: company?.verified || false,
    },
    salary: formatSalary(job.salaryMin, job.salaryMax, job.currency ? String(job.currency) : null, job.salaryText),
    location: locationText,
    workType: wt,
    region: "global",
    specialization: job.role || "",
    experience: job.experience.toLowerCase() as JobFrontend["experience"],
    tags: job.tags || [],
    description: job.description,
    requirements: job.requirements ? [job.requirements] : [],
    postedAt: (job.postedAt || job.createdAt).toISOString(),
    featured: job.featured,
    verified: job.verified || company?.verified || false,
    recruiterContact: job.recruiterContact || null,
    sourceUrl: job.sourceUrl || null,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency != null ? String(job.currency) : null,
    aiScore: job.aiScore ?? null,
    scoring: scoringJson ?? null,
    companyInfo: company
      ? {
          name: company.name,
          website: company.website,
          logo_url: normalizeLogoUrl(company.logoUrl),
          industry: company.industry,
          size: company.size,
          founded: company.founded,
          headquarters: company.headquarters,
          summary: company.summary,
          socials: socialsJson,
          domains: company.domains && company.domains.length ? company.domains : null,
        }
      : null,
    countryCity: job.countryCity || null,
    locationType: job.locationType || null,
    viewCount: job.viewCount ?? 0,
    applyCount: job.applyCount ?? 0,
  }
}

// ---------- Queries ----------

const JOB_INCLUDE = { company: true } as const

export async function getAllJobsFromDB(): Promise<JobFrontend[]> {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    include: JOB_INCLUDE,
    orderBy: [
      { featured: "desc" },
      { verified: "desc" },
      { postedAt: "desc" },
      { createdAt: "desc" },
    ],
  })
  return jobs.map(transformJob)
}

export async function getJobBySlugFromDB(slug: string): Promise<JobFrontend | null> {
  const job = await prisma.job.findUnique({
    where: { slug },
    include: JOB_INCLUDE,
  })
  if (!job) return null
  if (job.status !== "PUBLISHED") {
    // Only serve published on public pages.
    return null
  }
  return transformJob(job)
}

export async function getJobByExternalId(source: "JOB_ECO", externalId: number): Promise<JobFrontend | null> {
  const job = await prisma.job.findUnique({
    where: { source_externalId: { source, externalId } },
    include: JOB_INCLUDE,
  })
  if (!job || job.status !== "PUBLISHED") return null
  return transformJob(job)
}

export async function getSimilarJobs(jobSlug: string, limit: number = 6): Promise<JobFrontend[]> {
  const currentJob = await prisma.job.findUnique({
    where: { slug: jobSlug },
    include: JOB_INCLUDE,
  })
  if (!currentJob) return []

  const similarJobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: jobSlug },
      OR: [
        { tags: { hasSome: currentJob.tags.slice(0, 5) } },
        { companyId: currentJob.companyId || undefined },
        { experience: currentJob.experience },
      ],
    },
    include: JOB_INCLUDE,
    orderBy: [
      { featured: "desc" },
      { verified: "desc" },
      { postedAt: "desc" },
    ],
    take: limit,
  })
  return similarJobs.map(transformJob)
}

// Public list with filters (for /jobs page and /api/jobs).
export async function getJobsWithFilters(params: {
  page?: number
  limit?: number
  search?: string
  featured?: boolean
  verified?: boolean
  workType?: string[]
  experience?: string[]
  tags?: string[]
  salaryMin?: number
  sort?: string
}): Promise<{
  jobs: JobFrontend[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(200, Math.max(1, params.limit || 10))
  const skip = (page - 1) * limit

  const where: Prisma.JobWhereInput = { status: "PUBLISHED" }

  if (params.search?.trim()) {
    const q = params.search.trim()
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { hasSome: [q] } },
      { skills: { hasSome: [q] } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  if (params.featured !== undefined) where.featured = params.featured
  if (params.verified !== undefined) where.verified = params.verified

  if (params.workType && params.workType.length > 0) {
    where.workType = { in: params.workType.map((v) => v.toUpperCase()) as Prisma.JobWhereInput["workType"] extends { in?: infer X } ? X extends Array<infer Y> ? Y[] : never : never }
  }
  if (params.experience && params.experience.length > 0) {
    where.experience = { in: params.experience.map((v) => v.toUpperCase()) as any }
  }
  if (params.tags && params.tags.length > 0) {
    where.tags = { hasSome: params.tags }
  }
  if (params.salaryMin != null) {
    where.OR = [...(where.OR || []), { salaryMax: { gte: params.salaryMin } }, { salaryMin: { gte: params.salaryMin } }]
  }

  const sort = params.sort || "date_desc"
  const orderBy: Prisma.JobOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case "date_asc":
        return [{ featured: "desc" }, { postedAt: "asc" }, { createdAt: "asc" }]
      case "salary_desc":
        return [{ featured: "desc" }, { salaryMax: { sort: "desc", nulls: "last" } }, { postedAt: "desc" }]
      case "salary_asc":
        return [{ featured: "desc" }, { salaryMin: { sort: "asc", nulls: "last" } }, { postedAt: "desc" }]
      case "score_desc":
        return [{ featured: "desc" }, { aiScore: { sort: "desc", nulls: "last" } }, { postedAt: "desc" }]
      case "score_asc":
        return [{ featured: "desc" }, { aiScore: { sort: "asc", nulls: "last" } }, { postedAt: "desc" }]
      case "date_desc":
      default:
        return [{ featured: "desc" }, { verified: "desc" }, { postedAt: "desc" }, { createdAt: "desc" }]
    }
  })()

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, include: JOB_INCLUDE, orderBy, skip, take: limit }),
    prisma.job.count({ where }),
  ])

  return {
    jobs: jobs.map(transformJob),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  }
}

export async function getCompanyBySlugFromDB(slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } })
  if (!company) return null
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    website: company.website,
    description: company.description,
    logo: normalizeLogoUrl(company.logoUrl),
    verified: company.verified,
    industry: company.industry,
    size: company.size,
    founded: company.founded,
    headquarters: company.headquarters,
    summary: company.summary,
  }
}

export async function getJobsByCompanySlug(companySlug: string): Promise<JobFrontend[]> {
  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) return []

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, status: "PUBLISHED" },
    include: JOB_INCLUDE,
    orderBy: [{ featured: "desc" }, { verified: "desc" }, { postedAt: "desc" }, { createdAt: "desc" }],
  })
  return jobs.map(transformJob)
}
