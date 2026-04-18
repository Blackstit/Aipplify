import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getAllBlogPosts, BLOG_PER_PAGE } from "@/lib/mockBlog"
import { getAllCompanies } from "@/lib/companies"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aipplify.com"
const JOBS_PER_PAGE = 10

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  entries.push(
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/for-recruiters`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  )

  const blogPosts = getAllBlogPosts()
  const blogTotalPages = Math.ceil(blogPosts.length / BLOG_PER_PAGE)
  for (let bp = 2; bp <= blogTotalPages; bp++) {
    entries.push({
      url: `${SITE_URL}/blog/page/${bp}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    })
  }
  for (const post of blogPosts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  }

  try {
    const companies = await getAllCompanies()
    for (const company of companies) {
      entries.push({
        url: `${SITE_URL}/companies/${company.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  } catch (e) {
    console.error("Sitemap companies error:", e)
  }

  try {
    const total = await prisma.job.count({ where: { status: "PUBLISHED" } })
    const totalListingPages = Math.ceil(total / JOBS_PER_PAGE)

    for (let p = 2; p <= totalListingPages; p++) {
      entries.push({
        url: `${SITE_URL}/jobs?page=${p}`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.7,
      })
    }

    const jobs = await prisma.job.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, postedAt: true, updatedAt: true },
      orderBy: { postedAt: "desc" },
      take: 10000,
    })
    for (const j of jobs) {
      entries.push({
        url: `${SITE_URL}/jobs/${j.slug}`,
        lastModified: j.updatedAt || j.postedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch (e) {
    console.error("Sitemap generation error:", e)
  }

  return entries
}
