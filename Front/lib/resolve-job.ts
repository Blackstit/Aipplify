import { fetchVacancy, fetchVacancies, vacancyToJobFrontend } from "./job-eco-api"
import { generateJobSlug } from "./slug"

export async function resolveVacancyBySlug(slug: string) {
  const oldMatch = slug.match(/^job-eco-(\d+)$/)
  if (oldMatch) {
    const id = parseInt(oldMatch[1], 10)
    const item = await fetchVacancy(id)
    const job = vacancyToJobFrontend(item)
    if (job.slug !== slug) {
      return { redirect: job.slug }
    }
    return { job }
  }

  const idMatch = slug.match(/-(\d+)$/)
  if (idMatch) {
    const id = parseInt(idMatch[1], 10)
    try {
      const item = await fetchVacancy(id)
      const job = vacancyToJobFrontend(item)
      return { job }
    } catch {}
  }

  const params = new URLSearchParams()
  params.set("page", "1")
  params.set("per_page", "50")
  params.set("sort", "date_desc")
  const data = await fetchVacancies(params)
  for (const item of data.items || []) {
    const companyName = item.company?.name || item.company_name || null
    const candidateSlug = generateJobSlug(item.id, item.title, companyName)
    if (candidateSlug === slug) {
      return { job: vacancyToJobFrontend(item) }
    }
  }

  if (data.total > 50) {
    const maxPages = Math.min(Math.ceil(data.total / 50), 25)
    for (let page = 2; page <= maxPages; page++) {
      const p = new URLSearchParams()
      p.set("page", String(page))
      p.set("per_page", "50")
      const batch = await fetchVacancies(p)
      for (const item of batch.items || []) {
        const companyName = item.company?.name || item.company_name || null
        const candidateSlug = generateJobSlug(item.id, item.title, companyName)
        if (candidateSlug === slug) {
          return { job: vacancyToJobFrontend(item) }
        }
      }
    }
  }

  return null
}
