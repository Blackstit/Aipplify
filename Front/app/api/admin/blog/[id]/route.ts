import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readPosts, writePosts, readViews, BlogPostAdmin } from "@/lib/blog-admin"
import { readSecrets } from "@/lib/admin-secrets"
import { postToLinkedInWithTarget } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

async function tryLinkedInPost(postIdx: number, post: BlogPostAdmin) {
  const s = readSecrets()
  if (!s.linkedinAutoPost || !s.linkedinAccessToken) return
  const target = s.linkedinPostTarget ?? (s.linkedinOrgId ? "org" : "person")
  try {
    const result = await postToLinkedInWithTarget(s, target, {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      tags: post.tags,
    })
    // Write LinkedIn post IDs back to the article
    const posts = readPosts()
    if (posts[postIdx]) {
      if (result.personPostId) posts[postIdx].linkedinPersonPostId = result.personPostId
      if (result.orgPostId) posts[postIdx].linkedinOrgPostId = result.orgPostId
      writePosts(posts)
    }
  } catch (e) {
    console.error("[LinkedIn] auto-post failed:", e)
  }
}

export async function GET(req: Request, { params }: Ctx) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const posts = readPosts()
  const post = posts.find((p) => p.id === params.id)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const views = readViews()
  return NextResponse.json({ post: { ...post, views: views[post.slug] ?? 0 } })
}

export async function PUT(req: Request, { params }: Ctx) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const posts = readPosts()
  const idx = posts.findIndex((p) => p.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (body.slug && body.slug !== posts[idx].slug) {
    if (posts.some((p) => p.slug === body.slug)) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }
  }

  const wasPublished = posts[idx].status === "PUBLISHED"
  const updated = { ...posts[idx], ...body }

  if ("scheduledAt" in body) {
    if (body.scheduledAt) {
      if (updated.status === "DRAFT") updated.status = "SCHEDULED"
    } else {
      delete updated.scheduledAt
      if (updated.status === "SCHEDULED") updated.status = "DRAFT"
    }
  }
  posts[idx] = updated
  writePosts(posts)

  if (!wasPublished && updated.status === "PUBLISHED") {
    void tryLinkedInPost(idx, updated)
  }

  return NextResponse.json({ post: posts[idx] })
}

export async function DELETE(req: Request, { params }: Ctx) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const posts = readPosts()
  const idx = posts.findIndex((p) => p.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })

  posts.splice(idx, 1)
  writePosts(posts)

  return NextResponse.json({ ok: true })
}
