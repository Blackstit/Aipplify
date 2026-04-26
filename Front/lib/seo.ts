/** Tech keywords used to detect 💻 positions */
const TECH_KEYWORDS = [
  "developer", "engineer", "frontend", "backend", "fullstack", "full-stack",
  "full stack", "react", "vue", "angular", "node", "python", "typescript",
  "javascript", "golang", "rust", "swift", "kotlin", "java", "php", "ruby",
  "devops", "blockchain", "solidity", "web3", "smart contract", "data",
  "machine learning", "ml", " ai ", "cloud", "aws", "gcp", "azure",
  "docker", "kubernetes", "terraform", "sre", "mobile", "android", "ios",
  "defi", "nft", "protocol", "infrastructure", "platform", "architect",
  "designer", "ux", "ui",
]

/**
 * Pick the primary emoji for a job listing.
 * Priority: remote → salary → verified/featured → default 🚀
 */
export function pickJobEmoji(job: {
  workType: string
  salaryMin?: number | null
  salaryMax?: number | null
  salary?: string
  aiScore?: number | null
  featured?: boolean
  verified?: boolean
}): string {
  if (job.workType === "remote") return "🌍"
  if (job.salaryMin != null || job.salaryMax != null) return "💰"
  if (job.salary && job.salary !== "Not specified") return "💰"
  if (job.featured || job.verified || (job.aiScore != null && job.aiScore >= 7)) return "⭐"
  return "🚀"
}

/** Returns true if the job title/tags suggest a technical role (→ 💻 emoji). */
export function isTechJob(title: string, tags: string[]): boolean {
  const lower = ` ${title} ${tags.join(" ")} `.toLowerCase()
  return TECH_KEYWORDS.some((k) => lower.includes(k))
}

/** Returns true when the location is a real city, not a generic label. */
export function hasSpecificCity(location: string, workType: string): boolean {
  if (workType === "remote") return false
  const l = location.trim().toLowerCase()
  const generic = [
    "remote", "worldwide", "global", "hybrid", "office / on-site",
    "on-site", "onsite", "",
  ]
  return !generic.includes(l)
}

// ─── Job page ──────────────────────────────────────────────────────────────

/**
 * Build <title> for a job page.
 * Template: {Title} at {Company} {emoji} | Aipplify  (max 60 chars)
 */
export function buildJobTitle(
  title: string,
  companyName: string,
  emoji: string,
): string {
  const suffix = ` at ${companyName} ${emoji} | Aipplify`
  const full = title + suffix
  if (full.length <= 60) return full
  const maxTitle = 60 - suffix.length
  if (maxTitle <= 3) return `${title.slice(0, 45)} ${emoji} | Aipplify`
  return `${title.slice(0, maxTitle - 1)}…${suffix}`
}

/**
 * Build meta description for a job page.
 * Template: {emoji(s)} {Company} is hiring {Title}. {Location}. {Salary}. Apply now on Aipplify →
 * Max 160 chars.
 */
export function buildJobDescription(params: {
  emoji: string
  companyName: string
  title: string
  workType: string
  location: string
  salaryMin?: number | null
  salaryMax?: number | null
  salary?: string
  tags: string[]
}): string {
  const { emoji, companyName, title, workType, location, salaryMin, salaryMax, salary, tags } = params

  const loc =
    workType === "remote"
      ? "Fully remote"
      : workType === "hybrid"
        ? location && location.toLowerCase() !== "hybrid"
          ? `Hybrid · ${location}`
          : "Hybrid"
        : location || "On-site"

  let sal: string
  if (salaryMin != null && salaryMax != null) {
    sal = `$${Math.round(salaryMin / 1000)}k–$${Math.round(salaryMax / 1000)}k`
  } else if (salaryMin != null) {
    sal = `$${Math.round(salaryMin / 1000)}k+`
  } else if (salaryMax != null) {
    sal = `Up to $${Math.round(salaryMax / 1000)}k`
  } else if (salary && salary !== "Not specified") {
    sal = salary.length > 20 ? salary.slice(0, 20) : salary
  } else {
    sal = "Competitive salary"
  }

  const extras: string[] = []
  if (isTechJob(title, tags)) extras.push("💻")
  if (hasSpecificCity(location, workType)) extras.push("📍")

  const allEmoji = [emoji, ...extras.slice(0, 2)].join(" ")
  const cta = " Apply now on Aipplify →"
  const body = `${allEmoji} ${companyName} is hiring ${title}. ${loc}. ${sal}.`
  const full = body + cta

  if (full.length <= 160) return full
  const maxBody = 160 - cta.length
  return `${body.slice(0, maxBody - 1)}…${cta}`
}

// ─── Company page ───────────────────────────────────────────────────────────

/**
 * Build <title> for a company page.
 * Template: {Company} Jobs 2026 🚀 | Aipplify  (max 60 chars)
 */
export function buildCompanyTitle(companyName: string): string {
  const suffix = " Jobs 2026 🚀 | Aipplify"
  const full = companyName + suffix
  if (full.length <= 60) return full
  const max = 60 - suffix.length
  return `${companyName.slice(0, max - 1)}…${suffix}`
}

/**
 * Build meta description for a company page.
 * Template: ⭐ Work at {Company}: open positions, reviews, salaries. Join the team on Aipplify →
 */
export function buildCompanyDescription(companyName: string): string {
  const desc = `⭐ Work at ${companyName}: open positions, reviews, salaries. Join the team on Aipplify →`
  if (desc.length <= 160) return desc
  const cta = " on Aipplify →"
  const max = 160 - cta.length
  return `${desc.slice(0, max - 1)}…${cta}`
}

// ─── Blog page ──────────────────────────────────────────────────────────────

/**
 * Build <title> for a blog post.
 * Template: {Title} 🚀 | Aipplify Blog  (max 60 chars)
 * Strips any existing "| Aipplify…" suffix before applying.
 */
export function buildBlogTitle(rawTitle: string): string {
  const clean = rawTitle.replace(/\s*\|.*$/, "").trim()
  const suffix = " 🚀 | Aipplify Blog"
  const full = clean + suffix
  if (full.length <= 60) return full
  const max = 60 - suffix.length
  return `${clean.slice(0, max - 1)}…${suffix}`
}

/**
 * Build meta description for a blog post.
 * Template: {excerpt (1 sentence)} Read more on Aipplify →  (max 160 chars)
 */
export function buildBlogDescription(excerpt: string): string {
  const cta = " Read more on Aipplify →"
  const max = 160 - cta.length
  const trimmed = excerpt.length > max ? `${excerpt.slice(0, max - 1)}…` : excerpt
  return trimmed + cta
}
