import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const BLOG_PATH = path.join(DATA_DIR, "blog.json")
const VIEWS_PATH = path.join(DATA_DIR, "blog-views.json")
const CATS_PATH = path.join(DATA_DIR, "blog-categories.json")

export type BlogStatus = "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED"

export interface BlogPostAdmin {
  id: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  content: string
  author: { name: string; avatar: string; role: string }
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  image: string
  imageAlt: string
  faq: { q: string; a: string }[]
  status: BlogStatus
  scheduledAt?: string
  linkedinPersonPostId?: string
  linkedinOrgPostId?: string
}

export function readPosts(): BlogPostAdmin[] {
  const raw = fs.readFileSync(BLOG_PATH, "utf8")
  return (JSON.parse(raw) as Record<string, unknown>[]).map((p) => ({
    faq: [],
    status: "PUBLISHED" as BlogStatus,
    ...p,
  } as unknown as BlogPostAdmin))
}

export function writePosts(posts: BlogPostAdmin[]): void {
  fs.writeFileSync(BLOG_PATH, JSON.stringify(posts, null, 2), "utf8")
}

export function readViews(): Record<string, number> {
  try { return JSON.parse(fs.readFileSync(VIEWS_PATH, "utf8")) } catch { return {} }
}

export function writeViews(v: Record<string, number>): void {
  fs.writeFileSync(VIEWS_PATH, JSON.stringify(v, null, 2), "utf8")
}

export function incrementView(slug: string): void {
  const v = readViews()
  v[slug] = (v[slug] ?? 0) + 1
  writeViews(v)
}

export function readCategories(): string[] {
  try { return JSON.parse(fs.readFileSync(CATS_PATH, "utf8")) } catch {
    const cats = [...new Set(readPosts().map((p) => p.category).filter(Boolean))].sort() as string[]
    writeCategories(cats)
    return cats
  }
}

export function writeCategories(cats: string[]): void {
  fs.writeFileSync(CATS_PATH, JSON.stringify(cats, null, 2), "utf8")
}

export function nextId(posts: BlogPostAdmin[]): string {
  const max = posts.reduce((acc, p) => Math.max(acc, parseInt(p.id, 10) || 0), 0)
  return String(max + 1)
}
