import { prisma } from "@/lib/prisma"
import type { WorkType, ExperienceLevel, Currency, JobSource, JobStatus } from "@prisma/client"

interface DegenCryptoJob {
  title: string
  company: string // Просто строка, не объект
  location: string[]
  salary: string
  description: string
  qualifications: string
  featured: boolean
  tags: string[]
  topTags: string[]
  datePosted: string
  link: string
  source: string
}

interface DegenCryptoResponse {
  jobs: DegenCryptoJob[]
}

// Map location array to work type
function mapWorkType(locations: string[]): WorkType {
  const locationStr = locations.join(" ").toLowerCase()
  if (locationStr.includes("remote")) return "REMOTE"
  if (locationStr.includes("hybrid")) return "HYBRID"
  return "OFFICE"
}

// Map tags to experience level
function mapExperienceLevel(tags: string[], topTags: string[]): ExperienceLevel {
  const allTags = [...tags, ...topTags].join(" ").toLowerCase()
  if (allTags.includes("lead") || allTags.includes("head") || allTags.includes("founding")) return "LEAD"
  if (allTags.includes("senior")) return "SENIOR"
  if (allTags.includes("junior")) return "JUNIOR"
  if (allTags.includes("intern")) return "INTERN"
  return "MID"
}

// Parse salary from string like "$150k – $220k" or "$128K-$212K"
function parseSalary(salaryText: string): { min?: number; max?: number; currency?: Currency } {
  if (!salaryText || salaryText.trim() === "") {
    return {}
  }

  // Detect currency
  let currency: Currency | undefined = undefined
  if (salaryText.includes("$") || salaryText.toUpperCase().includes("USD")) {
    currency = "USD"
  } else if (salaryText.includes("€") || salaryText.toUpperCase().includes("EUR")) {
    currency = "EUR"
  } else if (salaryText.includes("£") || salaryText.toUpperCase().includes("GBP")) {
    currency = "GBP"
  } else if (salaryText.includes("₽") || salaryText.toUpperCase().includes("RUB")) {
    currency = "RUB"
  }

  // Extract numbers (handle "k" suffix for thousands)
  const numbers = salaryText.match(/(\d+)\s*k?/gi)
  if (!numbers || numbers.length === 0) {
    return { currency }
  }

  const parsedNumbers = numbers.map((num) => {
    const cleanNum = num.replace(/[^\d]/g, "")
    const multiplier = num.toLowerCase().includes("k") ? 1000 : 1
    return parseInt(cleanNum) * multiplier
  })

  if (parsedNumbers.length === 1) {
    return { min: parsedNumbers[0], currency }
  } else if (parsedNumbers.length >= 2) {
    return {
      min: Math.min(...parsedNumbers),
      max: Math.max(...parsedNumbers),
      currency,
    }
  }

  return { currency }
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

// Save or create company
async function saveCompany(companyName: string) {
  // Generate slug from company name
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  let slug = baseSlug
  let counter = 1

  // Ensure unique slug
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  let company = await prisma.company.findFirst({
    where: { name: companyName },
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        slug,
        name: companyName,
        verified: false, // DegenCryptoJobs doesn't provide verification status
      },
    })
    return { saved: true, company }
  }

  return { saved: false, company }
}

// Save or update job
export async function saveJob(jobData: DegenCryptoJob) {
  // Save company first
  const companyResult = await saveCompany(jobData.company)
  const company = companyResult.company

  // Generate slug from title and company
  const baseSlug = `${jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-at-${company.slug}`
    .replace(/^-+|-+$/g, "")
  const slug = await generateUniqueSlug(baseSlug)

  // Parse salary
  const salaryParsed = parseSalary(jobData.salary)

  // Map data
  const workType = mapWorkType(jobData.location)
  const experience = mapExperienceLevel(jobData.tags, jobData.topTags || [])
  const locationText = jobData.location.join(", ") || "Not specified"

  // Combine tags and topTags
  const allTags = [...(jobData.tags || []), ...(jobData.topTags || [])]
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 20) // Limit to 20 tags

  // Parse date
  const postedAt = jobData.datePosted ? new Date(jobData.datePosted) : new Date()

  // Check if job already exists (by link or slug)
  const existingJob = await prisma.job.findFirst({
    where: {
      OR: [{ slug: baseSlug }, { sourceUrl: jobData.link }],
    },
  })

  const jobPayload = {
    slug,
    title: jobData.title,
    description: jobData.description,
    requirements: jobData.qualifications || null,
    salaryText: jobData.salary || null,
    salaryMin: salaryParsed.min || null,
    salaryMax: salaryParsed.max || null,
    currency: salaryParsed.currency || null,
    locationText,
    workType,
    experience,
    tags: allTags,
    featured: jobData.featured || false,
    verified: false, // DegenCryptoJobs doesn't provide verification
    source: "PARSED" as JobSource,
    sourceUrl: jobData.link,
    status: "PUBLISHED" as JobStatus,
    postedAt,
    company: {
      connect: { id: company.id },
    },
  }

  if (existingJob) {
    // Update existing job
    return await prisma.job.update({
      where: { id: existingJob.id },
      data: {
        ...jobPayload,
        slug: undefined, // Don't update slug
        company: undefined, // Don't update company relation
        updatedAt: new Date(),
      },
    })
  } else {
    // Create new job
    return await prisma.job.create({
      data: jobPayload,
    })
  }
}

// Fetch jobs from DegenCryptoJobs API
export async function fetchDegenCryptoJobs(page: number = 1) {
  const url = `https://degencryptojobs.com/api/jobs?page=${page}`

  const headers: Record<string, string> = {
    accept: "*/*",
    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    referer: "https://degencryptojobs.com/",
    "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText} - ${errorText.substring(0, 500)}`)
  }

  const data: DegenCryptoResponse = await response.json()
  return data
}

// Parse and save jobs
export async function parseAndSaveJobs(page: number = 1, maxPages?: number) {
  const results = {
    jobsSaved: 0,
    jobsUpdated: 0,
    companiesSaved: 0,
    errors: [] as string[],
  }

  let currentPage = page
  let hasMorePages = true

  while (hasMorePages && (!maxPages || currentPage <= maxPages)) {
    try {
      console.log(`📄 Fetching page ${currentPage}...`)
      const response = await fetchDegenCryptoJobs(currentPage)

      if (!response.jobs || response.jobs.length === 0) {
        console.log(`✅ No more jobs found on page ${currentPage}`)
        hasMorePages = false
        break
      }

      console.log(`✅ Got ${response.jobs.length} jobs on page ${currentPage}`)

      for (const jobData of response.jobs) {
        try {
          // Check if job exists
          const existing = await prisma.job.findFirst({
            where: {
              OR: [{ sourceUrl: jobData.link }],
            },
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
          const errorMsg = `Error saving job "${jobData.title}" at ${jobData.company}: ${error instanceof Error ? error.message : String(error)}`
          console.error(`  ❌ ${errorMsg}`)
          results.errors.push(errorMsg)
        }
      }

      // If we got fewer jobs than expected, probably no more pages
      if (response.jobs.length < 20) {
        // Assuming ~20 jobs per page, adjust if needed
        hasMorePages = false
      } else {
        currentPage++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      const errorMsg = `Error fetching page ${currentPage}: ${error instanceof Error ? error.message : String(error)}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
      hasMorePages = false // Stop on error
    }
  }

  return results
}
