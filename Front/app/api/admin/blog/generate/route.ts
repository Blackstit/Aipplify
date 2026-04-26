import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readSecrets } from "@/lib/admin-secrets"
import { readPosts } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

const SYSTEM_PROMPT = `You are an expert content strategist and writer for Aipplify — a job board for AI, Crypto & Web3 professionals.
Write comprehensive, SEO-optimized English blog articles aimed at professionals seeking jobs or career growth in these industries.

Guidelines:
- Write in a professional yet engaging tone
- Include specific data, statistics, and examples where possible
- Structure content with clear headings (## for H2, ### for H3)
- Use markdown tables for comparisons and data
- Include actionable takeaways
- Target length: 1500–2500 words

CRITICAL: You MUST respond using EXACTLY this structure — three labeled XML sections in this exact order, nothing else before or after. ALL THREE sections are REQUIRED. Missing any section will cause a system error.

<META>
{"title":"Full clickable article title","metaTitle":"SEO title max 60 chars","metaDescription":"SEO description 150-160 chars with CTA","excerpt":"2-3 sentence summary for article cards","category":"one of: AI Career|Crypto Jobs|Productivity|Recruitment|Remote Work|Web3","tags":["tag1","tag2","tag3","tag4","tag5"],"imageQuery":"2-3 word Unsplash search query for cover image"}
</META>

<CONTENT>
Full markdown article body here. Start with the intro paragraph directly (no H1 title). Use ## for sections, ### for sub-sections. Include tables where useful.
</CONTENT>

<FAQ>
REQUIRED — always include exactly 5 FAQ pairs about the article topic. Use this exact format:

Q: First question readers have about this topic?
A: Detailed answer to the first question.

Q: Second question?
A: Detailed answer.

Q: Third question?
A: Detailed answer.

Q: Fourth question?
A: Detailed answer.

Q: Fifth question?
A: Detailed answer.
</FAQ>`

function buildUserPrompt(brief: string, recentTitles: string[]): string {
  const recentList = recentTitles.length
    ? `\n\nRecently published articles (DO NOT repeat these topics):\n${recentTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
    : ""
  return `Write a blog article based on this brief:\n\n${brief}${recentList}`
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const key = readSecrets().openrouterKey || ""

  if (!key) {
    return NextResponse.json({ error: "OpenRouter API key not configured. Add it in Settings." }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const { prompt, model = "anthropic/claude-3.5-haiku" } = body as { prompt: string; model: string }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  // Get recent 12 published article titles for context
  const posts = readPosts()
  const recentTitles = posts
    .filter((p) => !p.status || p.status === "PUBLISHED")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12)
    .map((p) => p.title)

  const userPrompt = buildUserPrompt(prompt, recentTitles)

  // Stream from OpenRouter
  const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aipplify.com",
      "X-Title": "Aipplify Admin",
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!orResponse.ok) {
    const err = await orResponse.text()
    return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 502 })
  }

  // Proxy the SSE stream to the client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = orResponse.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          // Forward raw SSE lines
          controller.enqueue(encoder.encode(chunk))
        }
      } catch {
        // ignore
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
