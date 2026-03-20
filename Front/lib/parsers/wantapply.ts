import { prisma } from "../prisma"

// Import types from Prisma schema
type WorkType = "REMOTE" | "HYBRID" | "OFFICE"
type ExperienceLevel = "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD"
type Currency = "USD" | "EUR" | "GBP" | "RUB"
type JobSource = "PARSED" | "HR_ADDED" | "COMPANY_ADDED" | "SELF_POSTED"
type JobStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

interface WantApplyJob {
  id: string
  title: string
  description: string
  url: string
  companyName: string
  companyId: string
  company: {
    id: string
    name: string
    slug: string
    isVerified: boolean
    logo?: {
      path: string
    }
  }
  levels: string[]
  workplaceTypes: string[]
  remote: boolean
  relocationSupport: boolean
  employmentTypes: string[]
  salary?: string
  salaryCurrency?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  isFeatured: boolean
  status: string
  createdAt: string
  publishedAt?: string | null
  expirationDate?: string | null
  jobLocations: Array<{
    iso3: string
    name_en: string
    name_ru?: string
  }>
  jobRegions: Array<{
    id?: number
    name_en: string
    name_ru?: string
  }>
  tags: string[]
  applyUrl?: string | null
}

interface WantApplyResponse {
  data: WantApplyJob[]
  hasNextPage: boolean
  total: number
}

// Map workplace types
function mapWorkplaceType(types: string[]): WorkType {
  if (types.includes("remote")) return "REMOTE"
  if (types.includes("hybrid")) return "HYBRID"
  return "OFFICE"
}

// Map experience level
function mapExperienceLevel(levels: string[]): ExperienceLevel {
  if (levels.includes("lead") || levels.includes("head")) return "LEAD"
  if (levels.includes("senior")) return "SENIOR"
  if (levels.includes("junior")) return "JUNIOR"
  if (levels.includes("intern")) return "INTERN"
  return "MID"
}

// Map currency
function mapCurrency(currency?: string | null): Currency | null {
  if (!currency) return null
  const upper = currency.toUpperCase()
  if (upper === "USD" || upper === "$") return "USD"
  if (upper === "EUR" || upper === "€") return "EUR"
  if (upper === "GBP" || upper === "£") return "GBP"
  if (upper === "RUB" || upper === "₽") return "RUB"
  return null
}

// Extract location text
function extractLocationText(job: WantApplyJob): string {
  if (job.remote) return "Remote"
  
  const locations = job.jobLocations.map(loc => loc.name_en)
  const regions = job.jobRegions.map(reg => reg.name_en)
  
  const allLocations = [...locations, ...regions]
  if (allLocations.length > 0) {
    return allLocations.join(", ")
  }
  
  return "Not specified"
}

// Parse salary from text
function parseSalary(salaryText?: string): { min?: number; max?: number } {
  if (!salaryText) return {}
  
  // Try to extract numbers from strings like "4000 - 6000 €" or "$50k - $80k"
  const match = salaryText.match(/(\d+)\s*-\s*(\d+)/i)
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2])
    }
  }
  
  // Try single number
  const singleMatch = salaryText.match(/(\d+)/)
  if (singleMatch) {
    const num = parseInt(singleMatch[1])
    return { min: num }
  }
  
  return {}
}

// Generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (await prisma.job.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`
  }
  
  return slug
}

// Save or update company
async function saveCompany(companyData: WantApplyJob["company"]) {
  let company = await prisma.company.findUnique({
    where: { slug: companyData.slug }
  })
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        slug: companyData.slug,
        name: companyData.name,
        logoUrl: companyData.logo?.path || null,
        verified: companyData.isVerified,
      }
    })
    return { saved: true, company }
  } else {
    // Update company if needed
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: companyData.name,
        logoUrl: companyData.logo?.path || company.logoUrl,
        verified: companyData.isVerified,
      }
    })
    return { saved: false, company }
  }
}

// Save or update job
export async function saveJob(jobData: WantApplyJob) {
  // Save company first (already done in parseAndSaveJobs, but keeping for standalone use)
  const companyResult = await saveCompany(jobData.company)
  const company = companyResult.company
  
  // Generate slug
  const baseSlug = jobData.url || `${jobData.title.toLowerCase().replace(/\s+/g, "-")}-at-${jobData.company.slug}`
  const slug = await generateUniqueSlug(baseSlug)
  
  // Parse salary
  const salaryParsed = parseSalary(jobData.salary)
  
  // Map data
  const workType = mapWorkplaceType(jobData.workplaceTypes)
  const experience = mapExperienceLevel(jobData.levels)
  const currency = mapCurrency(jobData.salaryCurrency)
  const locationText = extractLocationText(jobData)
  
  // Parse dates
  const postedAt = jobData.publishedAt ? new Date(jobData.publishedAt) : null
  const expiresAt = jobData.expirationDate ? new Date(jobData.expirationDate) : null
  
  // Determine status
  let status: JobStatus = "PUBLISHED"
  if (jobData.status === "draft") status = "DRAFT"
  if (expiresAt && expiresAt < new Date()) status = "ARCHIVED"
  
  // Check if job already exists (by external ID or slug)
  const existingJob = await prisma.job.findFirst({
    where: {
      OR: [
        { slug: baseSlug },
        { sourceUrl: { contains: jobData.id } }
      ]
    }
  })
  
  const jobPayload = {
    slug,
    title: jobData.title,
    description: jobData.description,
    requirements: null, // Not available in API response
    salaryText: jobData.salary || null,
    salaryMin: jobData.salaryMin || salaryParsed.min || null,
    salaryMax: jobData.salaryMax || salaryParsed.max || null,
    currency,
    locationText,
    workType,
    experience,
    tags: jobData.tags || [],
    featured: jobData.isFeatured || false,
    verified: jobData.company.isVerified || false,
    source: "PARSED" as JobSource,
    sourceUrl: `https://wantapply.com/jobs/${jobData.url}`,
    status,
    postedAt,
    expiresAt,
    companyId: company.id,
  }
  
  if (existingJob) {
    // Update existing job
    return await prisma.job.update({
      where: { id: existingJob.id },
      data: jobPayload
    })
  } else {
    // Create new job
    return await prisma.job.create({
      data: jobPayload
    })
  }
}

// Fetch jobs from wantapply API
export async function fetchWantApplyJobs(
  page: number = 1, 
  filters?: Record<string, any>,
  authToken?: string,
  cookies?: string
) {
  const baseUrl = "https://wantapply.com/api/jobs"
  const params = new URLSearchParams({
    page: page.toString(),
  })
  
  if (filters) {
    params.append("filters", JSON.stringify(filters))
  }
  
  const url = `${baseUrl}?${params.toString()}`
  
  // Minimal headers exactly like Postman - only authorization and cookie
  const headers: Record<string, string> = {}
  
  // Add authorization token if provided
  // Check if token already has "Bearer " prefix (from .env.local)
  if (authToken) {
    headers["authorization"] = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`
  } else if (process.env.WANTAPPLY_API_TOKEN) {
    const token = process.env.WANTAPPLY_API_TOKEN
    headers["authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`
  }
  
  // Add cookies if provided
  if (cookies) {
    headers["cookie"] = cookies
  } else if (process.env.WANTAPPLY_COOKIES) {
    headers["cookie"] = process.env.WANTAPPLY_COOKIES
  }
  
  // Add visitor ID if provided
  if (process.env.WANTAPPLY_VISITOR_ID) {
    headers["x-visitor-id"] = process.env.WANTAPPLY_VISITOR_ID
  }
  
  // Debug: log request details (without sensitive data)
  console.log(`  Request URL: ${url}`)
  console.log(`  Has auth token: ${!!headers["authorization"]}`)
  console.log(`  Has cookies: ${!!headers["cookie"]}`)
  if (headers["cookie"]) {
    console.log(`  Cookies preview: ${headers["cookie"].substring(0, 100)}...`)
    console.log(`  Cookies length: ${headers["cookie"].length}`)
    // Check for important cookies
    const hasCfClearance = headers["cookie"].includes("cf_clearance")
    const hasAuthToken = headers["cookie"].includes("auth-token-data")
    console.log(`  Has cf_clearance: ${hasCfClearance}`)
    console.log(`  Has auth-token-data: ${hasAuthToken}`)
  }
  
  const response = await fetch(url, { 
    method: "GET",
    headers,
    redirect: "follow"
  })
  
  console.log(`  Response status: ${response.status} ${response.statusText}`)
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    // Check if it's Cloudflare block
    if (errorText.includes("Cloudflare") || errorText.includes("cf-wrapper")) {
      console.error(`  ❌ Cloudflare blocked the request!`)
      console.error(`  Make sure cookies are fresh from browser (especially cf_clearance)`)
    }
    // Show first 300 chars of error
    const errorPreview = errorText.substring(0, 300).replace(/\n/g, " ")
    throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText} - ${errorPreview}...`)
  }
  
  const data: WantApplyResponse = await response.json()
  return data
}

// Parse and save jobs
export async function parseAndSaveJobs(
  page: number = 1, 
  maxPages?: number,
  authToken?: string,
  cookies?: string
) {
  const results = {
    jobsSaved: 0,
    jobsUpdated: 0,
    companiesSaved: 0,
    errors: [] as string[]
  }
  
  let currentPage = page
  let hasNextPage = true
  
  while (hasNextPage && (!maxPages || currentPage <= maxPages)) {
    try {
      console.log(`Fetching page ${currentPage}...`)
      const response = await fetchWantApplyJobs(
        currentPage, 
        { domain: "tech", search: "" },
        authToken,
        cookies
      )
      
      for (const jobData of response.data) {
        try {
          // Check if job exists
          const existing = await prisma.job.findFirst({
            where: {
              OR: [
                { slug: jobData.url },
                { sourceUrl: { contains: jobData.id } }
              ]
            }
          })
          
          // Save company and track if it was newly created
          const companyResult = await saveCompany(jobData.company)
          if (companyResult.saved) {
            results.companiesSaved++
          }
          
          await saveJob(jobData)
          
          if (existing) {
            results.jobsUpdated++
          } else {
            results.jobsSaved++
          }
        } catch (error) {
          const errorMsg = `Error saving job ${jobData.id}: ${error instanceof Error ? error.message : String(error)}`
          console.error(errorMsg)
          results.errors.push(errorMsg)
        }
      }
      
      hasNextPage = response.hasNextPage
      currentPage++
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      const errorMsg = `Error fetching page ${currentPage}: ${error instanceof Error ? error.message : String(error)}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
      break
    }
  }
  
  return results
}
