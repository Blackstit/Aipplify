import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readSecrets } from "@/lib/admin-secrets"
import { readPosts, readViews } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const key = readSecrets().openrouterKey || ""
  if (!key) return NextResponse.json({ error: "OpenRouter API key not configured." }, { status: 400 })

  const { model = "anthropic/claude-3.5-haiku" } = await request.json().catch(() => ({}))

  const posts = readPosts()
  const views = readViews()

  const published = posts.filter((p) => !p.status || p.status === "PUBLISHED")
  const drafts    = posts.filter((p) => p.status === "DRAFT")
  const archived  = posts.filter((p) => p.status === "ARCHIVED")

  const now   = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
  const week  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const thisMonth = published.filter((p) => new Date(p.publishedAt) >= month).length
  const thisWeek  = published.filter((p) => new Date(p.publishedAt) >= week).length

  const topByViews = [...published]
    .map((p) => ({ title: p.title, category: p.category, tags: p.tags, views: views[p.slug] ?? 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const catCounts: Record<string, number> = {}
  published.forEach((p) => { catCounts[p.category] = (catCounts[p.category] ?? 0) + 1 })

  const dates = published.map((p) => new Date(p.publishedAt)).sort((a, b) => a.getTime() - b.getTime())
  const avgDaysBetweenPosts = dates.length > 1
    ? Math.round((dates[dates.length - 1].getTime() - dates[0].getTime()) / (dates.length - 1) / 86400000)
    : null

  const blogData = {
    totals: { published: published.length, drafts: drafts.length, archived: archived.length },
    activity: { thisMonth, thisWeek },
    avgDaysBetweenPosts,
    topPosts: topByViews,
    categoryDistribution: catCounts,
    allTitles: published.map((p) => p.title),
    allTags: [...new Set(published.flatMap((p) => p.tags))],
  }

  const systemPrompt = `You are a senior content strategist specializing in crypto, Web3, and AI job boards.
Analyze the blog data provided and produce a comprehensive content health report in clean Markdown.

Structure your report with these exact sections:
## 📊 Content Health Score
Rate overall blog health 1-10 with brief reasoning.

## 🏆 Top Performing Content
Insights on what topics and formats drive engagement.

## 🕳️ Content Gaps
Topics missing from the blog that the audience likely needs. Be specific with 5-8 concrete suggestions.

## 📅 Publishing Consistency
Analysis of publishing frequency and patterns.

## 🏷️ Category & Tag Strategy
Which categories are over/under-represented. Recommendations.

## ⚡ Quick Wins
3-5 specific actionable improvements to make this week.

## 🗺️ Strategic Recommendations
3-5 longer-term content strategy recommendations.

Be specific, data-driven, and actionable. Reference actual article titles from the data.`

  const userPrompt = `Analyze this blog:\n\n${JSON.stringify(blogData, null, 2)}`

  const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aipplify.com",
      "X-Title": "Aipplify Admin",
    },
    body: JSON.stringify({
      model, stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    }),
  })

  if (!orResponse.ok) {
    const err = await orResponse.text()
    return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 502 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = orResponse.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(encoder.encode(decoder.decode(value, { stream: true })))
        }
      } catch { /* ignore */ } finally { controller.close() }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  })
}
