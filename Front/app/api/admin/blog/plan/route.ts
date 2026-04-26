import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readSecrets } from "@/lib/admin-secrets"
import { readPosts } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const key = readSecrets().openrouterKey || ""
  if (!key) return NextResponse.json({ error: "OpenRouter API key not configured." }, { status: 400 })

  const { brief = "", model = "anthropic/claude-3.5-haiku", count = 10 } =
    await request.json().catch(() => ({}))

  const posts = readPosts()
  const published = posts.filter((p) => !p.status || p.status === "PUBLISHED")
  const existingTitles = published
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 20)
    .map((p) => p.title)

  const catCounts: Record<string, number> = {}
  published.forEach((p) => { catCounts[p.category] = (catCounts[p.category] ?? 0) + 1 })

  const systemPrompt = `You are a content strategist for Aipplify — a job board for AI, Crypto & Web3 professionals.
Generate a data-driven content plan as a JSON array.

Each item MUST follow this exact schema:
{
  "title": "Full compelling article title",
  "category": "one of: AI Career|Crypto Jobs|Productivity|Recruitment|Remote Work|Web3",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "priority": "high|medium|low",
  "audience": "who this article targets",
  "rationale": "1 sentence: why this topic will perform well",
  "estimatedReadTime": "X min read"
}

Rules:
- DO NOT repeat topics already in the existing articles list
- Mix categories strategically
- Prioritize topics with high search intent
- Respond with ONLY a valid JSON array — no markdown, no extra text`

  const userPrompt = [
    brief ? `Brief from editor:\n${brief}\n` : "Generate a well-rounded content plan.",
    `\nPublish ${count} articles.`,
    `\nExisting categories distribution: ${JSON.stringify(catCounts)}`,
    `\nExisting articles (avoid these topics):\n${existingTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
  ].join("\n")

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
      temperature: 0.7,
      max_tokens: 3000,
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
