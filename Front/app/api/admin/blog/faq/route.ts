import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readSecrets } from "@/lib/admin-secrets"

export const dynamic = "force-dynamic"

function parseFAQ(text: string): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = []
  const pairs = text.matchAll(/Q:\s*(.*?)\n+A:\s*([\s\S]*?)(?=\n+Q:|\s*$)/gi)
  for (const [, q, a] of pairs) {
    if (q?.trim()) faq.push({ q: q.trim(), a: a?.trim() ?? "" })
  }
  return faq
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const key = readSecrets().openrouterKey || ""
  if (!key) return NextResponse.json({ error: "OpenRouter key not configured" }, { status: 400 })

  const { title, content } = await request.json()
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 })

  const prompt = `Generate exactly 5 FAQ (Frequently Asked Questions) for this blog article about "${title}".

${content ? `Article content (first 1500 chars):\n${String(content).slice(0, 1500)}` : ""}

Respond using EXACTLY this format — nothing else:

Q: First question?
A: First answer.

Q: Second question?
A: Second answer.

Q: Third question?
A: Third answer.

Q: Fourth question?
A: Fourth answer.

Q: Fifth question?
A: Fifth answer.`

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aipplify.com",
      "X-Title": "Aipplify Admin",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-haiku",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: "OpenRouter error" }, { status: 502 })
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ""
  const faq = parseFAQ(raw)

  return NextResponse.json({ faq })
}
