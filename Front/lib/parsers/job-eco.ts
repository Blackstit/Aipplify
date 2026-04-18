import { prisma } from "../prisma"
import { generateJobSlug } from "../slug"
import type { Currency, ExperienceLevel, JobSource, JobStatus, WorkType } from "@prisma/client"

// Matches /api/public/vacancies item shape (see lib/job-eco-api.ts).
export interface JobEcoVacancy {
  id: number
  title: string
  company_name: string | null
  role: string | null
  domains: string[] | null
  risk_label: string | null
  ai_score_value: number | null
  location_type: string | null
  salary_min_usd: number | null
  salary_max_usd: number | null
  currency: string | null
  seniority: string | null
  english_level: string | null
  employment_type: string | null
  experience_years: number | null
  country_city: string | null
  recruiter: string | null
  summary: string | null
  skills: string[] | null
  stack: string[] | null
  contacts: Record<string, string> | null
  source_url: string | null
  source_channel: string | null
  created_at: string
  description: string | null
  responsibilities: string | null
  requirements: string | null
  conditions: string | null
  raw_text: string | null
  scoring: {
    total_score: number
    overall_summary: string
    red_flags: string[]
    scoring_results: { criterion: string; key: string; score: number; weight: number; summary: string }[]
  } | null
  company: {
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
}

interface JobEcoResponse {
  page: number
  per_page: number
  total: number
  items: JobEcoVacancy[]
}

// ---------- mappers ----------

function mapWorkType(locationType: string | null | undefined): WorkType {
  const t = (locationType || "").toLowerCase()
  if (t === "remote") return "REMOTE"
  if (t === "hybrid") return "HYBRID"
  if (t === "office" || t === "on-site" || t === "onsite") return "OFFICE"
  return "REMOTE"
}

function mapExperience(seniority: string | null, title: string, role: string | null): ExperienceLevel {
  const s = (seniority || "").toLowerCase().trim()
  if (s === "trainee" || s === "intern" || s === "internship") return "INTERN"
  if (s === "junior") return "JUNIOR"
  if (s === "senior") return "SENIOR"
  if (s === "lead" || s === "head" || s === "c-level") return "LEAD"
  if (s === "middle" || s === "mid") return "MID"

  const text = `${title || ""} ${role || ""}`.toLowerCase()
  if (/\blead\b|\bhead\b|director/.test(text)) return "LEAD"
  if (/\bsenior\b|\bsr\b/.test(text)) return "SENIOR"
  if (/\bjunior\b|\bjr\b/.test(text)) return "JUNIOR"
  if (/\bintern/.test(text)) return "INTERN"
  return "MID"
}

function mapCurrency(c: string | null | undefined, hasSalary: boolean): Currency | null {
  if (!hasSalary) return null
  const u = (c || "USD").toUpperCase()
  if (u === "USD" || u === "EUR" || u === "GBP" || u === "RUB") return u as Currency
  return "USD"
}

function buildDescription(item: JobEcoVacancy, titleFallback: string): string {
  const parts: string[] = []
  if (item.summary?.trim()) parts.push(item.summary.trim())
  if (item.description?.trim()) parts.push(item.description.trim())
  if (item.responsibilities?.trim()) parts.push(`## What you'll do\n\n${item.responsibilities.trim()}`)
  if (item.conditions?.trim()) parts.push(`## Conditions\n\n${item.conditions.trim()}`)
  const body = parts.join("\n\n").trim()
  if (body) return body
  if (item.raw_text?.trim()) return item.raw_text.trim().slice(0, 50000)
  return titleFallback || "Vacancy"
}

function buildTags(item: JobEcoVacancy): string[] {
  const s = new Set<string>()
  for (const d of item.domains || []) if (d) s.add(String(d))
  for (const x of item.skills || []) if (x) s.add(String(x))
  for (const x of item.stack || []) if (x) s.add(String(x))
  return Array.from(s).slice(0, 30)
}

function formatRecruiterContact(item: JobEcoVacancy): string | null {
  const entries = Object.entries(item.contacts || {}).filter(([, v]) => v != null && String(v).trim() !== "")
  if (entries.length > 0) return entries.map(([k, v]) => `${k}: ${v}`).join(" | ")
  if (item.recruiter?.trim()) return item.recruiter.trim()
  return null
}

function buildSalaryText(min: number | null, max: number | null, currency: string): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()} ${currency}`
  if (max != null) return `Up to $${max.toLocaleString()} ${currency}`
  return `From $${min?.toLocaleString() ?? ""} ${currency}`
}

function buildLocationText(wt: WorkType, countryCity: string | null): string {
  if (countryCity && countryCity.trim()) return countryCity.trim()
  return wt === "REMOTE" ? "Remote" : wt === "HYBRID" ? "Hybrid" : "Office / on-site"
}

function slugifyCompanyName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company"
  )
}

// ---------- DB helpers ----------

async function upsertCompany(input: JobEcoVacancy): Promise<{ id: string; wasCreated: boolean }> {
  const name = (input.company?.name || input.company_name || "").trim() || "Unknown Company"
  const info = input.company

  const enriched = {
    website: info?.website ?? null,
    logoUrl: info?.logo_url ?? null,
    industry: info?.industry ?? null,
    size: info?.size ?? null,
    founded: info?.founded ?? null,
    headquarters: info?.headquarters ?? null,
    summary: info?.summary ?? null,
    socials: (info?.socials ?? null) as any,
    domains: info?.domains || [],
  }

  const existing = await prisma.company.findFirst({ where: { name } })
  if (existing) {
    await prisma.company.update({
      where: { id: existing.id },
      data: {
        // Don't wipe richer pre-existing data with nulls
        website: enriched.website ?? existing.website,
        logoUrl: enriched.logoUrl ?? existing.logoUrl,
        industry: enriched.industry ?? existing.industry,
        size: enriched.size ?? existing.size,
        founded: enriched.founded ?? existing.founded,
        headquarters: enriched.headquarters ?? existing.headquarters,
        summary: enriched.summary ?? existing.summary,
        socials: enriched.socials ?? (existing.socials as any),
        domains: enriched.domains.length ? enriched.domains : existing.domains,
      },
    })
    return { id: existing.id, wasCreated: false }
  }

  // Create with a unique slug.
  const base = slugifyCompanyName(name)
  let slug = base
  let i = 1
  while (await prisma.company.findUnique({ where: { slug } })) {
    i += 1
    slug = `${base}-${i}`
  }

  const created = await prisma.company.create({
    data: {
      slug,
      name,
      verified: false,
      ...enriched,
    },
  })
  return { id: created.id, wasCreated: true }
}

async function reserveUniqueSlug(desired: string, externalId: number): Promise<string> {
  // Keep slug idempotent per externalId so we don't churn.
  let slug = desired || `vacancy-${externalId}`
  const fallback = `vacancy-${externalId}`
  let tries = 0
  while (tries < 5) {
    const hit = await prisma.job.findUnique({ where: { slug }, select: { externalId: true, source: true } })
    if (!hit || (hit.source === "JOB_ECO" && hit.externalId === externalId)) return slug
    tries += 1
    slug = `${desired}-${externalId}`
    if (tries === 2) slug = `${fallback}-${Date.now().toString(36).slice(-4)}`
  }
  return fallback
}

export interface SaveResult {
  created: boolean
  companyCreated: boolean
}

export async function saveJobEcoVacancy(item: JobEcoVacancy): Promise<SaveResult> {
  const { id: companyId, wasCreated: companyCreated } = await upsertCompany(item)

  const title = (item.title || item.role || `Vacancy #${item.id}`).trim() || `Vacancy #${item.id}`
  const companyName = item.company?.name || item.company_name || null

  const desiredSlug = generateJobSlug(item.id, title, companyName)
  const slug = await reserveUniqueSlug(desiredSlug, item.id)

  const workType = mapWorkType(item.location_type)
  const experience = mapExperience(item.seniority, title, item.role)
  const salaryMin = item.salary_min_usd ?? null
  const salaryMax = item.salary_max_usd ?? null
  const hasSalary = salaryMin != null || salaryMax != null
  const currency = mapCurrency(item.currency, hasSalary)
  const currencyText = currency || "USD"

  const description = buildDescription(item, title)
  const tags = buildTags(item)
  const recruiterContact = formatRecruiterContact(item)
  const postedAt = item.created_at ? new Date(item.created_at) : new Date()
  const now = new Date()

  const existing = await prisma.job.findUnique({
    where: { source_externalId: { source: "JOB_ECO" as JobSource, externalId: item.id } },
    select: { id: true, status: true, featured: true, verified: true, slug: true },
  })

  // Shared field payload (never touches admin-controlled verified/featured/status here).
  const payload = {
    title,
    description,
    summary: item.summary?.trim() || null,
    requirements: item.requirements?.trim() || null,
    responsibilities: item.responsibilities?.trim() || null,
    conditions: item.conditions?.trim() || null,
    rawText: item.raw_text?.trim() || null,

    salaryText: buildSalaryText(salaryMin, salaryMax, currencyText),
    salaryMin,
    salaryMax,
    currency,

    locationText: buildLocationText(workType, item.country_city),
    workType,
    experience,

    tags,
    skills: item.skills || [],
    stack: item.stack || [],
    domains: item.domains || [],

    role: item.role || null,
    seniorityRaw: item.seniority || null,
    employmentType: item.employment_type || null,
    englishLevel: item.english_level || null,
    experienceYears: item.experience_years ?? null,
    countryCity: item.country_city || null,
    locationType: item.location_type || null,
    sourceChannel: item.source_channel || null,
    recruiter: item.recruiter || null,
    riskLabel: item.risk_label || null,
    aiScore: item.ai_score_value ?? null,
    scoring: (item.scoring ?? null) as any,
    contacts: (item.contacts ?? null) as any,

    source: "JOB_ECO" as JobSource,
    sourceUrl: item.source_url || null,
    externalId: item.id,
    recruiterContact,

    postedAt,
    lastSeenAt: now,
  }

  if (existing) {
    // Status logic: if admin archived or drafted, keep that. If we had auto-archived
    // and it reappeared upstream → republish.
    const nextStatus: JobStatus =
      existing.status === "ARCHIVED"
        ? "PUBLISHED"
        : existing.status // respect PUBLISHED / DRAFT as-is

    await prisma.job.update({
      where: { id: existing.id },
      data: {
        ...payload,
        status: nextStatus,
        // slug: keep existing slug (stable external URLs)
        company: { connect: { id: companyId } },
      },
    })
    return { created: false, companyCreated }
  }

  await prisma.job.create({
    data: {
      slug,
      ...payload,
      status: "PUBLISHED" as JobStatus,
      verified: false,
      featured: false,
      company: { connect: { id: companyId } },
    },
  })
  return { created: true, companyCreated }
}

// ---------- fetcher ----------

export async function fetchJobEcoPage(
  baseUrl: string,
  apiKey: string,
  page: number,
  perPage: number,
): Promise<JobEcoResponse> {
  const url = new URL("/api/public/vacancies", baseUrl.replace(/\/$/, ""))
  url.searchParams.set("page", String(page))
  url.searchParams.set("per_page", String(Math.min(perPage, 200)))
  url.searchParams.set("sort", "date_desc")

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    // Avoid Next.js fetch caching in sync context.
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`job-eco HTTP ${res.status}: ${text.slice(0, 400)}`)
  }

  return (await res.json()) as JobEcoResponse
}

// ---------- main sync ----------

export interface JobEcoSyncResult {
  jobsSaved: number
  jobsUpdated: number
  companiesSaved: number
  pagesFetched: number
  archived: number
  seen: number
  errors: string[]
  startedAt: string
  finishedAt: string
  durationMs: number
}

interface SyncOptions {
  /** Archive JOB_ECO jobs whose lastSeenAt is older than (now - staleAfterDays) after a successful full pull. Default 7. */
  staleAfterDays?: number
  /** Limit pages to fetch (safety). Default 500. */
  maxPages?: number
}

export async function syncAllJobEcoVacancies(opts: SyncOptions = {}): Promise<JobEcoSyncResult> {
  const startedAt = new Date()
  const result: JobEcoSyncResult = {
    jobsSaved: 0,
    jobsUpdated: 0,
    companiesSaved: 0,
    pagesFetched: 0,
    archived: 0,
    seen: 0,
    errors: [],
    startedAt: startedAt.toISOString(),
    finishedAt: "",
    durationMs: 0,
  }

  const baseUrl = (process.env.JOB_ECO_API_URL || "https://job-eco.aipplify.com").replace(/\/$/, "")
  const apiKey = process.env.JOB_ECO_API_KEY?.trim()
  if (!apiKey) {
    result.errors.push("JOB_ECO_API_KEY не задан — пропуск синхронизации job-eco")
    const finishedAt = new Date()
    result.finishedAt = finishedAt.toISOString()
    result.durationMs = finishedAt.getTime() - startedAt.getTime()
    return result
  }

  const perPage = Math.min(
    200,
    Math.max(1, parseInt(process.env.JOB_ECO_PER_PAGE || "200", 10) || 200),
  )
  const envMaxPages = parseInt(process.env.JOB_ECO_MAX_PAGES || "200", 10) || 200
  const maxPages = Math.min(500, Math.max(1, opts.maxPages ?? envMaxPages))
  const staleAfterDays = opts.staleAfterDays ?? 7

  let page = 1
  let totalPages = 1
  let completedAllPages = false

  try {
    while (page <= totalPages && page <= maxPages) {
      const data = await fetchJobEcoPage(baseUrl, apiKey, page, perPage)
      result.pagesFetched++

      const total = typeof data.total === "number" ? data.total : 0
      if (total > 0) {
        totalPages = Math.max(1, Math.ceil(total / perPage))
      } else {
        totalPages = page + 1
      }

      const items = data.items || []
      if (items.length === 0) {
        completedAllPages = true
        break
      }

      for (const item of items) {
        try {
          const r = await saveJobEcoVacancy(item)
          if (r.companyCreated) result.companiesSaved++
          if (r.created) result.jobsSaved++
          else result.jobsUpdated++
          result.seen++
        } catch (e) {
          const msg = `job-eco id=${item.id}: ${e instanceof Error ? e.message : String(e)}`
          result.errors.push(msg)
        }
      }

      if (items.length < perPage) {
        completedAllPages = true
        break
      }
      page++
    }
    if (page > maxPages) {
      result.errors.push(`maxPages=${maxPages} reached; скорее всего не всё забрано.`)
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e))
  }

  // Archive pass: only if we finished a full pull; otherwise we might wrongly archive.
  if (completedAllPages && result.seen > 0) {
    const cutoff = new Date(Date.now() - staleAfterDays * 24 * 60 * 60 * 1000)
    try {
      const archived = await prisma.job.updateMany({
        where: {
          source: "JOB_ECO",
          status: "PUBLISHED",
          OR: [
            { lastSeenAt: { lt: cutoff } },
            { lastSeenAt: null, createdAt: { lt: cutoff } },
          ],
        },
        data: { status: "ARCHIVED" },
      })
      result.archived = archived.count
    } catch (e) {
      result.errors.push(`archive sweep: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const finishedAt = new Date()
  result.finishedAt = finishedAt.toISOString()
  result.durationMs = finishedAt.getTime() - startedAt.getTime()
  return result
}
