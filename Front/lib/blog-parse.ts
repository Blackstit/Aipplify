// Shared parsing logic for AI-generated blog content

function repairJSON(s: string): string {
  let out = "", inStr = false, esc = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (esc) { out += ch; esc = false; continue }
    if (ch === "\\") { out += ch; esc = true; continue }
    if (ch === '"') { out += ch; inStr = !inStr; continue }
    if (inStr) {
      if (ch === "\n") { out += "\\n"; continue }
      if (ch === "\r") { out += "\\r"; continue }
      if (ch === "\t") { out += "\\t"; continue }
    }
    out += ch
  }
  return out
}

function tryJSON(s: string): Record<string, unknown> | null {
  try { return JSON.parse(s) } catch { /* */ }
  try { return JSON.parse(repairJSON(s)) } catch { /* */ }
  return null
}

function parseFAQ(block: string): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = []
  const pairs = block.matchAll(/Q:\s*(.*?)\n+A:\s*([\s\S]*?)(?=\n+Q:|\s*$)/gi)
  for (const [, q, a] of pairs) {
    if (q?.trim()) faq.push({ q: q.trim(), a: a?.trim() ?? "" })
  }
  return faq
}

export interface ParsedArticle {
  meta: Record<string, unknown>
  content: string
  faq: { q: string; a: string }[]
}

export function parseGeneratedOutput(raw: string): ParsedArticle | null {
  const metaM    = raw.match(/<META>([\s\S]*?)<\/META>/i)
  const contentM = raw.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/i)
  const faqM     = raw.match(/<FAQ>([\s\S]*?)<\/FAQ>/i)

  // ① Tagged format with <CONTENT>
  if (contentM) {
    return {
      meta: metaM ? (tryJSON(metaM[1].trim()) ?? {}) : {},
      content: contentM[1].trim(),
      faq: faqM ? parseFAQ(faqM[1]) : [],
    }
  }

  // ② <META> present, body between </META> and <FAQ> (or end)
  if (metaM) {
    const afterMeta = raw.slice(raw.toLowerCase().indexOf("</meta>") + 7)
    const faqStart  = afterMeta.toLowerCase().indexOf("<faq>")
    const body = (faqStart !== -1 ? afterMeta.slice(0, faqStart) : afterMeta).trim()
    return {
      meta: tryJSON(metaM[1].trim()) ?? {},
      content: body,
      faq: faqM ? parseFAQ(faqM[1]) : [],
    }
  }

  // ③ Full JSON blob — brace-walk to find outermost object
  const stripped = raw.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim()
  const jStart = stripped.indexOf("{")
  if (jStart !== -1) {
    let depth = 0, jEnd = -1
    for (let i = jStart; i < stripped.length; i++) {
      if (stripped[i] === "{") depth++
      else if (stripped[i] === "}") { if (--depth === 0) { jEnd = i; break } }
    }
    if (jEnd !== -1) {
      const parsed = tryJSON(stripped.slice(jStart, jEnd + 1))
      if (parsed) return {
        meta: parsed,
        content: (parsed.content as string) ?? "",
        faq: Array.isArray(parsed.faq) ? parsed.faq as { q: string; a: string }[] : [],
      }
    }
  }

  // ④ Raw markdown fallback
  if (raw.trim().length > 200) return { meta: {}, content: raw.trim(), faq: [] }

  return null
}
