import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readPosts, writePosts, BlogPostAdmin } from "@/lib/blog-admin"
import { readSecrets } from "@/lib/admin-secrets"
import { postToLinkedInWithTarget } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

async function tryLinkedInPost(post: BlogPostAdmin, idx: number) {
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
    const posts = readPosts()
    if (posts[idx]) {
      if (result.personPostId) posts[idx].linkedinPersonPostId = result.personPostId
      if (result.orgPostId) posts[idx].linkedinOrgPostId = result.orgPostId
      writePosts(posts)
    }
  } catch (e) {
    console.error("[LinkedIn] scheduled post failed:", e)
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const posts = readPosts()
  const now = new Date()
  const published: string[] = []
  const toLinkedIn: { post: BlogPostAdmin; idx: number }[] = []

  posts.forEach((p, idx) => {
    if ((p.status === "SCHEDULED" || p.status === "DRAFT") && p.scheduledAt && new Date(p.scheduledAt) <= now) {
      p.status = "PUBLISHED"
      p.publishedAt = now.toISOString()
      delete p.scheduledAt
      published.push(p.title)
      toLinkedIn.push({ post: { ...p }, idx })
    }
  })

  if (published.length > 0) {
    writePosts(posts)
    for (const { post, idx } of toLinkedIn) {
      await tryLinkedInPost(post, idx)
    }
  }

  return NextResponse.json({ published, count: published.length })
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const posts = readPosts()
  const scheduled = posts
    .filter((p) => (p.status === "SCHEDULED" || (p.status === "DRAFT" && p.scheduledAt)))
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .map(({ content: _c, ...p }) => p)

  const drafts = posts
    .filter((p) => p.status === "DRAFT" && !p.scheduledAt)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(({ content: _c, ...p }) => p)

  return NextResponse.json({ scheduled, drafts })
}
