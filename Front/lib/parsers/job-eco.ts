import { prisma } from "../prisma"
import type { Currency, ExperienceLevel, JobSource, JobStatus, WorkType } from "@prisma/client"

/** Ответ GET /api/public/vacancies */
export interface JobEcoVacancy {
  id: number
  title: string
  company_name: string
  role: string
  domains: string[]
  risk_label: string | null
  ai_score_value: number | null
  location_type: string
  salary_min_usd: number | null
  salary_max_usd: number | null
  recruiter: string | null
  summary: string
  skills: string[]
  stack: string[]
  contacts: Record<string, string>
  source_url: string
  created_at: string
  description: string
  responsibilities: string
  requirements: string
  conditions: string
  raw_text: string
}

interface JobEcoResponse {
  page: number
  per_page: number
  total: number
  items: JobEcoVacancy[]
}

function mapWorkType(locationType: string): WorkType {
  const t = (locationType || "").toLowerCase()
  if (t === "remote") return "REMOTE"
  if (t === "hybrid") return "HYBRID"
  return "OFFICE"
}

function mapExperience(title: string, role: string): ExperienceLevel {
  const text = `${title} ${role}`.toLowerCase()
  if (text.includes("lead") || text.includes("head") || text.includes("director")) return "LEAD"
  if (text.includes("senior") || text.includes("sr ")) return "SENIOR"
  if (text.includes("junior") || text.includes("jr ")) return "JUNIOR"
  if (text.includes("intern")) return "INTERN"
  return "MID"
}

function buildDescription(item: JobEcoVacancy, titleFallback: string): string {
  const parts: string[] = []
  if (item.summary?.trim()) parts.push(item.summary.trim())
  if (item.description?.trim()) parts.push(item.description.trim())
  if (item.responsibilities?.trim()) {
    parts.push(`## What you'll do\n\n${item.responsibilities.trim()}`)
  }
  if (item.conditions?.trim()) {
    parts.push(`## Conditions\n\n${item.conditions.trim()}`)
  }
  const body = parts.join("\n\n").trim()
  if (body) return body
  if (item.raw_text?.trim()) return item.raw_text.trim().slice(0, 50000)
  return titleFallback || "Vacancy"
}

function buildTags(item: JobEcoVacancy): string[] {
  const s = new Set<string>()
  for (const d of item.domains || []) {
    if (d) s.add(String(d))
  }
  for (const x of item.skills || []) {
    if (x) s.add(String(x))
  }
  for (const x of item.stack || []) {
    if (x) s.add(String(x))
  }
  if (item.risk_label) s.add(`risk:${item.risk_label}`)
  s.add("job-eco")
  return Array.from(s).slice(0, 30)
}

function formatRecruiterContact(item: JobEcoVacancy): string | null {
  const entries = Object.entries(item.contacts || {}).filter(([, v]) => v != null && String(v).trim() !== "")
  if (entries.length > 0) {
    return entries.map(([k, v]) => `${k}: ${v}`).join(" | ")
  }
  if (item.recruiter?.trim()) return item.recruiter.trim()
  return null
}

async function saveCompany(companyName: string) {
  const name = companyName?.trim() || "Unknown Company"
  const existing = await prisma.company.findFirst({ where: { name } })
  if (existing) return { saved: false as const, company: existing }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  let slug = baseSlug
  let counter = 1
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const company = await prisma.company.create({
    data: {
      slug,
      name,
      verified: false,
    },
  })
  return { saved: true as const, company }
}

const SLUG_PREFIX = "job-eco-"

export async function fetchJobEcoPage(
  baseUrl: string,
  apiKey: string,
  page: number,
  perPage: number,
): Promise<JobEcoResponse> {
  const url = new URL("/api/public/vacancies", baseUrl.replace(/\/$/, ""))
  url.searchParams.set("page", String(page))
  url.searchParams.set("per_page", String(Math.min(perPage, 200)))

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`job-eco HTTP ${res.status}: ${text.slice(0, 400)}`)
  }

  return (await res.json()) as JobEcoResponse
}

export async function saveJobEcoVacancy(
  item: JobEcoVacancy,
): Promise<{ jobCreated: boolean; companyCreated: boolean }> {
  const slug = `${SLUG_PREFIX}${item.id}`
  const companyResult = await saveCompany(item.company_name)
  const company = companyResult.company

  const title =
    [item.title, item.role]
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .find((t) => t.length > 0) || `Vacancy #${item.id}`

  const workType = mapWorkType(item.location_type)
  const experience = mapExperience(title, item.role || "")
  const description = buildDescription(item, title)
  const tags = buildTags(item)
  const recruiterContact = formatRecruiterContact(item)
  const postedAt = item.created_at ? new Date(item.created_at) : new Date()

  const salaryMin = item.salary_min_usd ?? null
  const salaryMax = item.salary_max_usd ?? null
  const hasSalary = salaryMin != null || salaryMax != null

  const existing = await prisma.job.findFirst({
    where: {
      OR: [{ slug }, { sourceUrl: item.source_url }],
    },
  })

  const jobPayload = {
    title,
    description,
    requirements: item.requirements?.trim() || null,
    salaryText: hasSalary
      ? [salaryMin != null ? `$${salaryMin}` : null, salaryMax != null ? `$${salaryMax}` : null]
          .filter(Boolean)
          .join(" – ") + " USD"
      : null,
    salaryMin: salaryMin,
    salaryMax: salaryMax,
    currency: hasSalary ? ("USD" as Currency) : null,
    locationText:
      workType === "REMOTE"
        ? "Remote"
        : workType === "HYBRID"
          ? "Hybrid"
          : "Office / on-site",
    workType,
    experience,
    tags,
    featured: false,
    verified: false,
    source: "JOB_ECO" as JobSource,
    sourceUrl: item.source_url,
    recruiterContact,
    status: "PUBLISHED" as JobStatus,
    postedAt,
  }

  if (existing) {
    await prisma.job.update({
      where: { id: existing.id },
      data: {
        ...jobPayload,
        slug: existing.slug.startsWith(SLUG_PREFIX) ? existing.slug : slug,
        company: { connect: { id: company.id } },
      },
    })
    return { jobCreated: false, companyCreated: companyResult.saved }
  }

  await prisma.job.create({
    data: {
      slug,
      ...jobPayload,
      company: { connect: { id: company.id } },
    },
  })
  return { jobCreated: true, companyCreated: companyResult.saved }
}

export interface JobEcoSyncResult {
  jobsSaved: number
  jobsUpdated: number
  companiesSaved: number
  pagesFetched: number
  errors: string[]
}

/**
 * Забирает все страницы вакансий из job-eco и upsert в локальную БД.
 */
export async function syncAllJobEcoVacancies(): Promise<JobEcoSyncResult> {
  const result: JobEcoSyncResult = {
    jobsSaved: 0,
    jobsUpdated: 0,
    companiesSaved: 0,
    pagesFetched: 0,
    errors: [],
  }

  const baseUrl = (process.env.JOB_ECO_API_URL || "https://job-eco.aipplify.com").replace(/\/$/, "")
  const apiKey = process.env.JOB_ECO_API_KEY?.trim()
  if (!apiKey) {
    result.errors.push("JOB_ECO_API_KEY не задан — пропуск синхронизации job-eco")
    return result
  }

  const perPage = Math.min(
    200,
    Math.max(1, parseInt(process.env.JOB_ECO_PER_PAGE || "200", 10) || 200),
  )

  let page = 1
  let totalPages = 1
  const maxPages = Math.min(500, Math.max(1, parseInt(process.env.JOB_ECO_MAX_PAGES || "100", 10) || 100))

  try {
    while (page <= totalPages && page <= maxPages) {
      const data = await fetchJobEcoPage(baseUrl, apiKey, page, perPage)
      result.pagesFetched++

      const total = typeof data.total === "number" ? data.total : 0
      if (total > 0) {
        totalPages = Math.max(1, Math.ceil(total / perPage))
      } else {
        // API не вернул total — идём страницами, пока приходит полная страница
        totalPages = page + 1
      }

      const items = data.items || []
      if (items.length === 0) break

      for (const item of items) {
        try {
          const { jobCreated, companyCreated } = await saveJobEcoVacancy(item)
          if (companyCreated) result.companiesSaved++
          if (jobCreated) result.jobsSaved++
          else result.jobsUpdated++
        } catch (e) {
          const msg = `job-eco id=${item.id}: ${e instanceof Error ? e.message : String(e)}`
          result.errors.push(msg)
        }
      }

      if (items.length < perPage) break
      page++
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e))
  }

  return result
}
