import { prisma } from "@/lib/prisma"
import type { Job, Company } from "@prisma/client"

// Define a more comprehensive Job type for the frontend
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
  experience: "intern" | "junior" | "mid" | "senior" | "lead"
  tags: string[]
  description: string
  requirements: string[]
  postedAt: string
  featured: boolean
  verified: boolean
  recruiterContact?: string | null
}

// Transform Prisma Job to frontend format
export function transformJob(job: Job & { company: Company | null }): JobFrontend {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: {
      id: job.company?.id || "",
      name: job.company?.name || "Unknown Company",
      slug: job.company?.slug || "",
      logo: job.company?.logoUrl || null,
      verified: job.company?.verified || false,
    },
    salary: job.salaryText || 
      (job.salaryMin && job.salaryMax 
        ? `${job.salaryMin} - ${job.salaryMax} ${job.currency || ""}`.trim()
        : job.salaryMin 
          ? `From ${job.salaryMin} ${job.currency || ""}`.trim()
          : "Not specified"),
    location: job.locationText,
    workType: job.workType.toLowerCase() as "remote" | "hybrid" | "office",
    region: "global" as const, // TODO: Extract from location if needed
    specialization: "", // TODO: Extract from tags or add field
    experience: job.experience.toLowerCase() as "intern" | "junior" | "mid" | "senior" | "lead",
    tags: job.tags,
    description: job.description,
    requirements: job.requirements 
      ? (typeof job.requirements === "string" ? [job.requirements] : Array.isArray(job.requirements) ? job.requirements : [])
      : [],
    postedAt: job.postedAt?.toISOString() || job.createdAt.toISOString(),
    featured: job.featured,
    verified: job.verified || job.company?.verified || false,
    recruiterContact: job.recruiterContact || null,
  }
}

// Get all jobs from database
export async function getAllJobsFromDB() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: {
      company: true
    },
    orderBy: [
      { featured: "desc" },
      { verified: "desc" },
      { postedAt: "desc" },
      { createdAt: "desc" }
    ]
  })
  
  return jobs.map(transformJob)
}

// Get job by slug
export async function getJobBySlugFromDB(slug: string) {
  const job = await prisma.job.findUnique({
    where: { slug },
    include: {
      company: true
    }
  })
  
  if (!job) return null
  
  return transformJob(job)
}

// Get similar jobs by tags, company, or experience level
export async function getSimilarJobs(jobSlug: string, limit: number = 6) {
  const currentJob = await prisma.job.findUnique({
    where: { slug: jobSlug },
    include: { company: true }
  })

  if (!currentJob) return []

  const where: any = {
    status: "PUBLISHED",
    slug: { not: jobSlug }, // Exclude current job
  }

  // Find jobs with similar tags, same company, or same experience level
  const similarJobs = await prisma.job.findMany({
    where: {
      ...where,
      OR: [
        // Jobs with overlapping tags
        { tags: { hasSome: currentJob.tags.slice(0, 5) } },
        // Jobs from same company
        { companyId: currentJob.companyId },
        // Jobs with same experience level
        { experience: currentJob.experience },
      ],
    },
    include: {
      company: true,
    },
    orderBy: [
      { featured: "desc" },
      { verified: "desc" },
      { postedAt: "desc" },
    ],
    take: limit,
  })

  return similarJobs.map(transformJob)
}

// Get jobs with filters
export async function getJobsWithFilters(params: {
  page?: number
  limit?: number
  search?: string
  featured?: boolean
  verified?: boolean
  workType?: string[]
  experience?: string[]
  tags?: string[]
}) {
  const page = params.page || 1
  const limit = params.limit || 10
  const skip = (page - 1) * limit
  
  const where: any = {
    status: "PUBLISHED"
  }
  
  // Search filter
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { tags: { hasSome: [params.search] } },
      { company: { name: { contains: params.search, mode: "insensitive" } } }
    ]
  }
  
  // Featured filter
  if (params.featured !== undefined) {
    where.featured = params.featured
  }
  
  // Verified filter
  if (params.verified !== undefined) {
    where.OR = [
      { verified: params.verified },
      { company: { verified: params.verified } }
    ]
  }
  
  // Work type filter
  if (params.workType && params.workType.length > 0) {
    where.workType = { in: params.workType.map(wt => wt.toUpperCase()) }
  }
  
  // Experience filter
  if (params.experience && params.experience.length > 0) {
    where.experience = { in: params.experience.map(exp => exp.toUpperCase()) }
  }
  
  // Tags filter
  if (params.tags && params.tags.length > 0) {
    where.tags = { hasSome: params.tags }
  }
  
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true
      },
      orderBy: [
        { featured: "desc" },
        { verified: "desc" },
        { postedAt: "desc" },
        { createdAt: "desc" }
      ],
      skip,
      take: limit
    }),
    prisma.job.count({ where })
  ])
  
  return {
    jobs: jobs.map(transformJob),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

// Get company by slug
export async function getCompanyBySlugFromDB(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
  })
  
  if (!company) return null
  
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    website: company.website,
    description: company.description,
    logo: company.logoUrl,
    verified: company.verified,
  }
}

// Get jobs by company slug
export async function getJobsByCompanySlug(companySlug: string) {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  })
  
  if (!company) return []
  
  const jobs = await prisma.job.findMany({
    where: {
      companyId: company.id,
      status: "PUBLISHED",
    },
    include: {
      company: true,
    },
    orderBy: [
      { featured: "desc" },
      { verified: "desc" },
      { postedAt: "desc" },
      { createdAt: "desc" },
    ],
  })
  
  return jobs.map(transformJob)
}
