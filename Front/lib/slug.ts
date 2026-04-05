const STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "of", "in", "on", "for", "to", "with", "by", "from", "is", "are",
])

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
}

function transliterate(text: string): string {
  let result = ""
  for (const ch of text.toLowerCase()) {
    result += CYRILLIC_MAP[ch] ?? ch
  }
  return result
}

function cleanPart(text: string): string {
  return transliterate(text)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
    .join("-")
}

export function generateJobSlug(id: number, title: string, companyName?: string | null): string {
  const cleanTitle = cleanPart(title || `vacancy-${id}`)
  const cleanCompany = companyName ? cleanPart(companyName) : ""

  let slug = cleanCompany ? `${cleanTitle}-at-${cleanCompany}` : cleanTitle

  if (slug.length > 65) {
    const titleWords = cleanTitle.split("-")
    let truncated = ""
    for (const w of titleWords) {
      const next = truncated ? `${truncated}-${w}` : w
      if (cleanCompany && `${next}-at-${cleanCompany}`.length > 65) break
      if (!cleanCompany && next.length > 65) break
      truncated = next
    }
    slug = cleanCompany ? `${truncated || titleWords[0]}-at-${cleanCompany}` : truncated || titleWords[0]
  }

  slug = slug.replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-")
  if (!slug) slug = `vacancy-${id}`

  return slug
}

export function parseJobIdFromSlug(slug: string): number | null {
  const m = slug.match(/(?:^|\-)(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}
