import {
  fetchLanding,
  fetchVacancies,
  vacancyToJobFrontend,
  type JobEcoItem,
} from "./job-eco-api"

export interface CompanyInfo {
  slug: string
  name: string
  logo: string | null
  industry: string | null
  jobCount: number
  website: string | null
  size: string | null
  headquarters: string | null
  summary: string | null
  socials: Record<string, string> | null
  founded: string | null
  domains: string[] | null
}

export function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function getAllCompanies(): Promise<CompanyInfo[]> {
  try {
    const landing = await fetchLanding()
    const companies: CompanyInfo[] = (landing.companies || []).map((c) => ({
      slug: companySlug(c.name),
      name: c.name,
      logo: c.logo_url || null,
      industry: c.industry || null,
      jobCount: c.job_count || 0,
      website: null,
      size: null,
      headquarters: null,
      summary: null,
      socials: null,
      founded: null,
      domains: null,
    }))
    return companies
      .filter((c) => c.slug && c.name)
      .sort((a, b) => b.jobCount - a.jobCount)
  } catch (e) {
    console.error("Failed to fetch companies:", e)
    return []
  }
}

export async function getCompanyBySlug(
  slug: string,
): Promise<CompanyInfo | null> {
  const all = await getAllCompanies()
  const basic = all.find((c) => c.slug === slug)
  if (!basic) return null

  try {
    const params = new URLSearchParams()
    params.set("search", basic.name)
    params.set("page", "1")
    params.set("per_page", "1")
    const data = await fetchVacancies(params)
    const firstItem = data.items?.[0]

    if (firstItem?.company) {
      return {
        ...basic,
        website: firstItem.company.website || basic.website,
        size: firstItem.company.size || basic.size,
        headquarters: firstItem.company.headquarters || basic.headquarters,
        summary: firstItem.company.summary || basic.summary,
        socials: firstItem.company.socials || basic.socials,
        founded: firstItem.company.founded || basic.founded,
        domains: firstItem.company.domains || basic.domains,
        jobCount: data.total || basic.jobCount,
      }
    }
  } catch {
    // fallback to basic info
  }

  return basic
}

export async function getCompanyJobs(companyName: string, page = 1, perPage = 20) {
  const params = new URLSearchParams()
  params.set("search", companyName)
  params.set("page", String(page))
  params.set("per_page", String(perPage))
  params.set("sort", "date_desc")

  const data = await fetchVacancies(params)
  const jobs = (data.items || [])
    .filter(
      (item) =>
        (item.company_name || item.company?.name || "")
          .toLowerCase()
          .includes(companyName.toLowerCase()),
    )
    .map(vacancyToJobFrontend)

  return { jobs, total: jobs.length }
}

export function getSimilarCompanies(
  companies: CompanyInfo[],
  currentSlug: string,
  limit = 6,
): CompanyInfo[] {
  const current = companies.find((c) => c.slug === currentSlug)
  if (!current) return companies.slice(0, limit)

  return companies
    .filter((c) => c.slug !== currentSlug)
    .sort((a, b) => {
      let scoreA = 0
      let scoreB = 0
      if (a.industry && a.industry === current.industry) scoreA += 3
      if (b.industry && b.industry === current.industry) scoreB += 3
      scoreA += a.jobCount
      scoreB += b.jobCount
      return scoreB - scoreA
    })
    .slice(0, limit)
}
