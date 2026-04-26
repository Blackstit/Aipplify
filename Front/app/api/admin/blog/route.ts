import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readPosts, writePosts, readViews, nextId, type BlogPostAdmin } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || ""
  const search = (searchParams.get("search") || "").toLowerCase().trim()

  const posts = readPosts()
  const views = readViews()

  let filtered = [...posts]
  if (status && ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(status)) {
    filtered = filtered.filter((p) => p.status === status)
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search)),
    )
  }

  const result = filtered
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(({ content: _c, ...p }) => ({ ...p, views: views[p.slug] ?? 0 }))

  return NextResponse.json({
    posts: result,
    total: posts.length,
    counts: {
      published:  posts.filter((p) => p.status === "PUBLISHED").length,
      draft:      posts.filter((p) => p.status === "DRAFT").length,
      scheduled:  posts.filter((p) => p.status === "SCHEDULED").length,
      archived:   posts.filter((p) => p.status === "ARCHIVED").length,
    },
  })
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const posts = readPosts()

  if (!body.slug?.trim()) return NextResponse.json({ error: "Slug required" }, { status: 400 })
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 })
  if (posts.some((p) => p.slug === body.slug.trim())) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
  }

  const now = new Date().toISOString()
  const newPost: BlogPostAdmin = {
    id: nextId(posts),
    slug: body.slug.trim(),
    title: body.title.trim(),
    metaTitle: body.metaTitle || body.title,
    metaDescription: body.metaDescription || "",
    excerpt: body.excerpt || "",
    content: body.content || "",
    author: body.author || { name: "Aipplify Team", avatar: "", role: "Editor" },
    category: body.category || "Web3",
    tags: body.tags || [],
    publishedAt: body.publishedAt || now,
    readTime: body.readTime || "5 min read",
    image: body.image || "",
    imageAlt: body.imageAlt || "",
    faq: body.faq || [],
    status: body.scheduledAt ? "SCHEDULED" : (body.status || "DRAFT"),
    ...(body.scheduledAt ? { scheduledAt: body.scheduledAt } : {}),
  }

  posts.unshift(newPost)
  writePosts(posts)

  return NextResponse.json({ post: newPost }, { status: 201 })
}
