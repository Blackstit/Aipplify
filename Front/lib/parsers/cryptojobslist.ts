import { prisma } from "../prisma"
import Parser from "rss-parser"
import type { WorkType, ExperienceLevel, Currency, JobSource, JobStatus } from "@prisma/client"

interface CryptoJobsListRSSItem {
  title: string
  link: string
  guid: string
  pubDate?: string
  creator?: string // Company name from dc:creator
  content?: string // HTML description
  contentSnippet?: string // Plain text description
  "media:location"?: string
  "content:encoded"?: string
}

interface CryptoJobsListRSSFeed {
  items: CryptoJobsListRSSItem[]
}

// Helper function to extract text from HTML and clean it
function stripHtml(html: string): string {
  if (!html) return ""
  
  // First, remove images
  html = html.replace(/<img[^>]*>/gi, "")
  
  // Remove tags section at the beginning (before first <h3> or <p>)
  // Pattern: <p>Tags: <a>...</a> • <a>...</a>...</p>
  html = html.replace(/<p>\s*Tags:\s*<a[^>]*>[^<]*<\/a>\s*(•\s*<a[^>]*>[^<]*<\/a>\s*)*<\/p>/i, "")
  html = html.replace(/<p>\s*Tags:\s*([^<]*<a[^>]*>[^<]*<\/a>[^<]*\s*•\s*)*[^<]*<\/p>/i, "")
  
  // Remove "Apply here 👉" links at the end
  html = html.replace(/<strong>Apply here<\/strong>\s*👉\s*<a[^>]*>.*?<\/a>/gi, "")
  html = html.replace(/Apply here\s*👉\s*<a[^>]*>.*?<\/a>/gi, "")
  
  // Convert HTML lists to plain text with bullets
  html = html.replace(/<ul[^>]*>/gi, "\n")
  html = html.replace(/<\/ul>/gi, "\n")
  html = html.replace(/<ol[^>]*>/gi, "\n")
  html = html.replace(/<\/ol>/gi, "\n")
  html = html.replace(/<li[^>]*>/gi, "• ")
  html = html.replace(/<\/li>/gi, "\n")
  
  // Convert headings to plain text with line breaks
  html = html.replace(/<h[1-6][^>]*>/gi, "\n\n")
  html = html.replace(/<\/h[1-6]>/gi, "\n\n")
  
  // Convert paragraphs to line breaks
  html = html.replace(/<p[^>]*>/gi, "\n")
  html = html.replace(/<\/p>/gi, "\n")
  
  // Convert <strong> and <b> to markdown-style bold (we'll remove later)
  html = html.replace(/<(strong|b)[^>]*>/gi, "")
  html = html.replace(/<\/(strong|b)>/gi, "")
  
  // Convert <em> and <i> to markdown-style italic (we'll remove later)
  html = html.replace(/<(em|i)[^>]*>/gi, "")
  html = html.replace(/<\/(em|i)>/gi, "")
  
  // Remove all remaining HTML tags
  html = html.replace(/<[^>]*>/g, "")
  
  // Decode HTML entities
  html = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
  
  // Clean up whitespace
  html = html
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .replace(/[ \t]+/g, " ") // Multiple spaces to single space
    .replace(/\n /g, "\n") // Remove spaces after newlines
    .replace(/ \n/g, "\n") // Remove spaces before newlines
    .trim()
  
  // Remove "Tags:" line if it still exists (plain text version)
  html = html.replace(/^Tags:\s*([^•\n]*\s*•\s*)*[^•\n]*\s*/i, "")
  
  return html
}

// Extract tags from HTML description
function extractTags(html: string): string[] {
  const tags: string[] = []
  
  // Extract tags from links like <a href="https://cryptojobslist.com/web3">Web3 Jobs</a>
  const tagRegex = /<a[^>]*href="https:\/\/cryptojobslist\.com\/[^"]*"[^>]*>([^<]+)<\/a>/gi
  let match
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].trim()
    // Remove "Jobs" suffix if present
    const cleanTag = tag.replace(/\s+Jobs?$/i, "").trim()
    if (cleanTag && !tags.includes(cleanTag)) {
      tags.push(cleanTag)
    }
  }
  
  return tags.slice(0, 20) // Limit to 20 tags
}

// Map location string to work type
function mapWorkType(location: string): WorkType {
  const locLower = location.toLowerCase()
  if (locLower.includes("remote")) return "REMOTE"
  if (locLower.includes("hybrid")) return "HYBRID"
  return "OFFICE"
}

// Map tags to experience level
function mapExperienceLevel(tags: string[], description: string): ExperienceLevel {
  const allText = [...tags, description].join(" ").toLowerCase()
  if (allText.includes("lead") || allText.includes("head") || allText.includes("founding")) return "LEAD"
  if (allText.includes("senior")) return "SENIOR"
  if (allText.includes("junior")) return "JUNIOR"
  if (allText.includes("intern")) return "INTERN"
  return "MID"
}

// Parse salary from description
function parseSalary(description: string): { min?: number; max?: number; currency?: Currency } {
  // Look for patterns like "$150k – $220k" or "$128K-$212K"
  const salaryPatterns = [
    /\$(\d+)\s*k?\s*[–-]\s*\$(\d+)\s*k?/i,
    /\$(\d+)\s*k?\s*to\s*\$(\d+)\s*k?/i,
    /\$(\d+)\s*k?\s*-\s*\$(\d+)\s*k?/i,
  ]

  for (const pattern of salaryPatterns) {
    const match = description.match(pattern)
    if (match) {
      const min = parseInt(match[1]) * (match[1].toLowerCase().includes("k") ? 1000 : 1)
      const max = parseInt(match[2]) * (match[2].toLowerCase().includes("k") ? 1000 : 1)
      return { min, max, currency: "USD" }
    }
  }

  // Single salary
  const singleMatch = description.match(/\$(\d+)\s*k?/i)
  if (singleMatch) {
    const amount = parseInt(singleMatch[1]) * (singleMatch[0].toLowerCase().includes("k") ? 1000 : 1)
    return { min: amount, currency: "USD" }
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

// Save or create company
async function saveCompany(companyName: string) {
  if (!companyName || companyName.trim() === "") {
    throw new Error("Company name is required")
  }

  // Fast path: if company already exists by name, do not generate new slug candidates.
  const existingByName = await prisma.company.findFirst({
    where: { name: companyName },
  })
  if (existingByName) {
    return { saved: false, company: existingByName }
  }

  const baseSlug = companyName
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
      name: companyName,
      verified: false,
    },
  })
  return { saved: true, company }
}

// Save or update job
export async function saveJob(item: CryptoJobsListRSSItem) {
  const companyName = item.creator || "Unknown Company"
  const companyResult = await saveCompany(companyName)
  const company = companyResult.company

  // Keep base slug deterministic for matching/updating existing records.
  const baseSlug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-at-${company.slug}`.replace(/^-+|-+$/g, "")

  // Extract description HTML
  const descriptionHtml = item.content || item["content:encoded"] || item.contentSnippet || ""
  
  // Extract tags BEFORE cleaning description (so we can remove them)
  const tags = extractTags(descriptionHtml)
  
  // Clean description: remove HTML, tags section, and other noise
  let description = stripHtml(descriptionHtml)
  
  // Additional cleanup: remove any remaining tag references at the start
  description = description.replace(/^Tags:\s*([^•\n]*\s*•\s*)*[^•\n]*\s*/i, "")
  
  // Remove "Apply here" references if they still exist
  description = description.replace(/Apply here\s*👉.*$/i, "").trim()
  
  // Remove privacy policy links and similar footer text
  description = description.replace(/To see our Privacy Policy.*$/i, "").trim()
  description = description.replace(/These are the applicable requisites.*$/i, "").trim()

  // Parse salary
  const salaryParsed = parseSalary(descriptionHtml)

  // Map location
  const location = item["media:location"] || "Not specified"
  const workType = mapWorkType(location)

  // Map experience level
  const experience = mapExperienceLevel(tags, description)

  // Parse date
  const postedAt = item.pubDate ? new Date(item.pubDate) : new Date()

  // Check if job already exists
  const existingJob = await prisma.job.findFirst({
    where: {
      OR: [{ slug: baseSlug }, { sourceUrl: item.link }],
    },
  })

  // Generate unique slug only for truly new records.
  const slug = existingJob ? existingJob.slug : await generateUniqueSlug(baseSlug)

  const jobPayload = {
    slug,
    title: item.title,
    description,
    requirements: null, // RSS doesn't provide separate requirements field
    salaryText: null, // We could try to extract from description, but it's complex
    salaryMin: salaryParsed.min || null,
    salaryMax: salaryParsed.max || null,
    currency: salaryParsed.currency || null,
    locationText: location,
    workType,
    experience,
    tags,
    featured: false, // RSS doesn't indicate featured status
    verified: false,
    source: "PARSED" as JobSource,
    sourceUrl: item.link,
    status: "PUBLISHED" as JobStatus,
    postedAt,
    company: {
      connect: { id: company.id },
    },
  }

  if (existingJob) {
    return await prisma.job.update({
      where: { id: existingJob.id },
      data: {
        ...jobPayload,
        slug: undefined,
        company: undefined,
        updatedAt: new Date(),
      },
    })
  } else {
    return await prisma.job.create({
      data: jobPayload,
    })
  }
}

// Fetch jobs from RSS feed
export async function fetchCryptoJobsListRSS() {
  const parser = new Parser({
    customFields: {
      item: ["media:location", "content:encoded", "dc:creator"],
    },
  })

  const url = "https://api.cryptojobslist.com/jobs.rss"

  try {
    const feed = await parser.parseURL(url)
    return feed as CryptoJobsListRSSFeed
  } catch (error) {
    throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Parse and save jobs
export async function parseAndSaveJobs() {
  const results = {
    jobsSaved: 0,
    jobsUpdated: 0,
    companiesSaved: 0,
    errors: [] as string[],
  }

  try {
    console.log("📡 Fetching RSS feed from cryptojobslist.com...")
    const feed = await fetchCryptoJobsListRSS()

    if (!feed.items || feed.items.length === 0) {
      console.log("✅ No jobs found in RSS feed")
      return results
    }

    console.log(`✅ Got ${feed.items.length} jobs from RSS feed`)

    for (let i = 0; i < feed.items.length; i++) {
      const item = feed.items[i]
      try {
        // Check if job exists
        const existing = await prisma.job.findFirst({
          where: {
            OR: [{ sourceUrl: item.link }],
          },
        })

        // Save company and track if it was newly created
        const companyName = item.creator || "Unknown Company"
        const companyResult = await saveCompany(companyName)
        if (companyResult.saved) {
          results.companiesSaved++
        }

        await saveJob(item)

        if (existing) {
          results.jobsUpdated++
        } else {
          results.jobsSaved++
        }
      } catch (error) {
        const errorMsg = `Error saving job "${item.title}": ${error instanceof Error ? error.message : String(error)}`
        console.error(`  ❌ ${errorMsg}`)
        results.errors.push(errorMsg)
      }

      if ((i + 1) % 20 === 0) {
        console.log(`⏳ Progress: ${i + 1}/${feed.items.length}`)
      }
    }

    console.log(`✅ Parsing completed: ${results.jobsSaved} saved, ${results.jobsUpdated} updated`)
  } catch (error) {
    const errorMsg = `Error fetching RSS feed: ${error instanceof Error ? error.message : String(error)}`
    console.error(`❌ ${errorMsg}`)
    results.errors.push(errorMsg)
  }

  return results
}
