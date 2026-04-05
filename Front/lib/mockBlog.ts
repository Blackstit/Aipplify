import blogData from "@/data/blog.json"

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  image: string
  imageAlt: string
  metaTitle: string
  metaDescription: string
  faq?: { q: string; a: string }[]
}

const posts = blogData as BlogPost[]

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
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return getAllBlogPosts()
  return getAllBlogPosts().filter((post) => post.category === category)
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

export function getPaginatedBlogPosts(page: number): {
  posts: BlogPost[]
  total: number
  totalPages: number
  page: number
} {
  const all = getAllBlogPosts()
  const total = all.length
  const totalPages = Math.ceil(total / BLOG_PER_PAGE)
  const safePage = Math.max(1, Math.min(page, totalPages))
  return {
    posts: all.slice((safePage - 1) * BLOG_PER_PAGE, safePage * BLOG_PER_PAGE),
    total,
    totalPages,
    page: safePage,
  }
}

export function getRelatedPosts(
  currentSlug: string,
  limit = 3,
): BlogPost[] {
  const current = getBlogPostBySlug(currentSlug)
  if (!current) return getAllBlogPosts().slice(0, limit)

  const scored = getAllBlogPosts()
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0
      if (p.category === current.category) score += 3
      score += p.tags.filter((t) => current.tags.includes(t)).length
      return { post: p, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.post)
}
