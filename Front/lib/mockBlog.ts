import fs from "fs"
import path from "path"

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: { name: string; avatar: string; role: string }
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  image: string
  imageAlt: string
  metaTitle: string
  metaDescription: string
  faq?: { q: string; a: string }[]
  status?: string
}

function readFromDisk(): BlogPost[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data/blog.json"), "utf8")
    return JSON.parse(raw) as BlogPost[]
  } catch {
    return []
  }
}

/** Returns only PUBLISHED posts (missing status = published for back-compat). */
function publishedPosts(): BlogPost[] {
  return readFromDisk().filter((p) => !p.status || p.status === "PUBLISHED")
}

export const BLOG_CATEGORIES = [
  "All",
  "AI Career",
  "Crypto Jobs",
  "Remote Work",
  "Web3",
  "Recruitment",
  "Productivity",
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export function getAllBlogPosts(): BlogPost[] {
  return publishedPosts().sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return publishedPosts().find((p) => p.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return getAllBlogPosts()
  return getAllBlogPosts().filter((p) => p.category === category)
}

export function searchBlogPosts(query: string): BlogPost[] {
  const q = query.toLowerCase()
  return getAllBlogPosts().filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q),
  )
}

export const BLOG_PER_PAGE = 9

export function getPaginatedBlogPosts(page: number) {
  const all = getAllBlogPosts()
  const total = all.length
  const totalPages = Math.ceil(total / BLOG_PER_PAGE)
  const safePage = Math.max(1, Math.min(page, totalPages || 1))
  return {
    posts: all.slice((safePage - 1) * BLOG_PER_PAGE, safePage * BLOG_PER_PAGE),
    total,
    totalPages,
    page: safePage,
  }
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(currentSlug)
  if (!current) return getAllBlogPosts().slice(0, limit)
  return getAllBlogPosts()
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      post: p,
      score:
        (p.category === current.category ? 3 : 0) +
        p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post)
}
