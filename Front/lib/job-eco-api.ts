import { generateJobSlug as _generateSlug } from "@/lib/slug"

const JOB_ECO_API_URL = (process.env.JOB_ECO_API_URL || "https://job-eco.aipplify.com").replace(/\/$/, "")
const JOB_ECO_API_KEY = process.env.JOB_ECO_API_KEY || ""

export interface JobEcoItem {
  id: number
  title: string
  company_name: string | null
  role: string | null
  domains: string[]
  risk_label: string | null
  ai_score_value: number | null
  location_type: string | null
  salary_min_usd: number | null
  salary_max_usd: number | null
  currency: string | null
  seniority: string | null
  english_level: string | null
  employment_type: string | null
  language_requirements: Record<string, string> | null
  experience_years: number | null
  country_city: string | null
  recruiter: string | null
  summary: string | null
  skills: string[]
  stack: string[]
  contacts: Record<string, string>
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
  semantic_similarity?: number | null
}

export interface JobEcoListResponse {
  page: number
  per_page: number
  total: number
  items: JobEcoItem[]
  q?: string
}

export interface JobEcoLandingResponse {
  stats: { total_vacancies: number; total_companies: number }
  companies: { name: string; logo_url: string; industry: string | null; job_count: number }[]
  recent_jobs: {
    id: number
    title: string
    company_name: string | null
    salary_min: number | null
    salary_max: number | null
    location_type: string | null
    ai_score: number | null
  }[]
}

export interface JobEcoFacetsResponse {
  skills: { name: string; count: number }[]
  roles: { name: string; count: number }[]
  countries: { name: string; count: number }[]
  seniority: { name: string; count: number }[]
  domains: { name: string; count: number }[]
}

async function jobEcoFetch<T>(path: string, revalidate = 120): Promise<T> {
  const url = `${JOB_ECO_API_URL}${path}`
  const res = await fetch(url, {
    headers: { "X-API-Key": JOB_ECO_API_KEY, Accept: "application/json" },
    next: { revalidate },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`job-eco ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

export async function fetchLanding(): Promise<JobEcoLandingResponse> {
  return jobEcoFetch<JobEcoLandingResponse>("/api/public/landing", 300)
}

export async function fetchVacancies(params: URLSearchParams): Promise<JobEcoListResponse> {
  const qs = params.toString()
  return jobEcoFetch<JobEcoListResponse>(`/api/public/vacancies${qs ? `?${qs}` : ""}`)
}

export async function fetchVacancy(id: number): Promise<JobEcoItem> {
  return jobEcoFetch<JobEcoItem>(`/api/public/vacancies/${id}`)
}

export async function fetchSemanticSearch(params: URLSearchParams): Promise<JobEcoListResponse> {
  const qs = params.toString()
  return jobEcoFetch<JobEcoListResponse>(`/api/public/vacancies/semantic-search${qs ? `?${qs}` : ""}`)
}

export async function fetchFacets(): Promise<JobEcoFacetsResponse> {
  return jobEcoFetch<JobEcoFacetsResponse>("/api/public/facets", 600)
}

function mapSeniority(s: string | null): "intern" | "junior" | "mid" | "senior" | "lead" {
  if (!s) return "mid"
  const l = s.toLowerCase()
  if (l === "trainee" || l === "intern" || l === "internship") return "intern"
  if (l === "junior") return "junior"
  if (l === "senior") return "senior"
  if (l === "lead" || l === "head" || l === "c-level") return "lead"
  return "mid"
}

function mapWorkType(lt: string | null): "remote" | "hybrid" | "office" {
  if (!lt) return "remote"
  const l = lt.toLowerCase()
  if (l === "hybrid") return "hybrid"
  if (l === "office") return "office"
  return "remote"
}

function buildSalaryText(item: JobEcoItem): string {
  const { salary_min_usd: min, salary_max_usd: max } = item
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()}`
  if (max != null) return `Up to $${max.toLocaleString()}`
  if (min != null) return `From $${min.toLocaleString()}`
  return "Not specified"
}

function buildDescription(item: JobEcoItem): string {
  const parts: string[] = []
  if (item.summary?.trim()) parts.push(item.summary.trim())
  if (item.description?.trim()) parts.push(item.description.trim())
  if (item.responsibilities?.trim()) parts.push(`## What you'll do\n\n${item.responsibilities.trim()}`)
  if (item.conditions?.trim()) parts.push(`## Conditions\n\n${item.conditions.trim()}`)
  const body = parts.join("\n\n").trim()
  if (body) return body
  if (item.raw_text?.trim()) return item.raw_text.trim().slice(0, 50000)
  return item.title || "Vacancy"
}

function buildTags(item: JobEcoItem): string[] {
  const s = new Set<string>()
  for (const d of item.domains || []) if (d) s.add(d)
  for (const x of item.skills || []) if (x) s.add(x)
  return Array.from(s).slice(0, 30)
}

function formatContacts(item: JobEcoItem): string | null {
  const entries = Object.entries(item.contacts || {}).filter(([, v]) => v != null && String(v).trim() !== "")
  if (entries.length > 0) return entries.map(([k, v]) => `${k}: ${v}`).join(" | ")
  if (item.recruiter?.trim()) return item.recruiter.trim()
  return null
}

export function vacancyToJobFrontend(item: JobEcoItem) {
  const companyName = item.company?.name || item.company_name || null
  const slug = _generateSlug(item.id, item.title, companyName)
  const wt = mapWorkType(item.location_type)

  return {
    id: String(item.id),
    slug,
    title: item.title || `Vacancy #${item.id}`,
    company: {
      id: "",
      name: companyName || "Unknown Company",
      slug: "",
      logo: item.company?.logo_url || null,
      verified: false,
    },
    salary: buildSalaryText(item),
    location: wt === "remote" ? "Remote" : wt === "hybrid" ? "Hybrid" : "Office / on-site",
    workType: wt,
    region: "global" as const,
    specialization: item.role || "",
    experience: mapSeniority(item.seniority),
    tags: buildTags(item),
    description: buildDescription(item),
    requirements: item.requirements ? [item.requirements] : [],
    postedAt: item.created_at || new Date().toISOString(),
    featured: false,
    verified: item.risk_label !== "high-risk",
    recruiterContact: formatContacts(item),
    sourceUrl: item.source_url || null,
    salaryMin: item.salary_min_usd ?? null,
    salaryMax: item.salary_max_usd ?? null,
    currency: item.currency || (item.salary_min_usd != null || item.salary_max_usd != null ? "USD" : null),
    aiScore: item.ai_score_value ?? null,
    scoring: item.scoring ?? null,
    companyInfo: item.company ?? null,
    countryCity: item.country_city || item.company?.headquarters || null,
    locationType: item.location_type || null,
  }
}
