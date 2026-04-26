import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readPosts, writePosts } from "@/lib/blog-admin"
import { readSecrets } from "@/lib/admin-secrets"
import { postToLinkedInWithTarget } from "@/lib/linkedin"
import type { LinkedInPostTarget } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

export async function POST(req: Request, { params }: Ctx) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const posts = readPosts()
  const idx = posts.findIndex((p) => p.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const post = posts[idx]
  if (post.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Article must be published first" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const target: LinkedInPostTarget = ["person", "org", "both"].includes(body.target)
    ? body.target
    : "person"

  const secrets = readSecrets()
  if (!secrets.linkedinAccessToken) {
    return NextResponse.json({ error: "LinkedIn not connected" }, { status: 400 })
  }

  try {
    const result = await postToLinkedInWithTarget(secrets, target, {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      tags: post.tags,
    })

    if (result.personPostId) posts[idx].linkedinPersonPostId = result.personPostId
    if (result.orgPostId) posts[idx].linkedinOrgPostId = result.orgPostId
    writePosts(posts)

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "LinkedIn post failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
