import { prisma } from "@/lib/prisma"
import { transformJob, type JobFrontend } from "@/lib/jobs"
import { fetchVacancy, vacancyToJobFrontend } from "@/lib/job-eco-api"

/**
 * Resolve a job by its URL slug. Prefers the local DB (cache of job-eco / manual entries),
 * falls back to a live job-eco fetch only when nothing is found locally.
 *
 * Also handles legacy slugs like `job-eco-123` → redirect to the canonical slug stored in DB.
 */
export async function resolveVacancyBySlug(
  slug: string,
): Promise<{ job: JobFrontend } | { redirect: string } | null> {
  // 1. Exact slug match in DB.
  const direct = await prisma.job.findUnique({
    where: { slug },
    include: { company: true },
  })
  if (direct && direct.status === "PUBLISHED") {
    return { job: transformJob(direct) }
  }

  // 2. Legacy `job-eco-<id>` slug → find by externalId in DB and redirect.
  const legacyMatch = slug.match(/^job-eco-(\d+)$/)
  if (legacyMatch) {
    const externalId = parseInt(legacyMatch[1], 10)
    const byExternal = await prisma.job.findUnique({
      where: { source_externalId: { source: "JOB_ECO", externalId } },
      include: { company: true },
    })
    if (byExternal && byExternal.status === "PUBLISHED") {
      if (byExternal.slug !== slug) return { redirect: byExternal.slug }
      return { job: transformJob(byExternal) }
    }
    // Not in cache — try live fetch.
    try {
      const item = await fetchVacancy(externalId)
      const mapped = vacancyToJobFrontend(item)
      if (mapped.slug !== slug) return { redirect: mapped.slug }
      return { job: mapped as unknown as JobFrontend }
    } catch {
      return null
    }
  }

  // 3. Slug ending in numeric id (our current shape for job-eco rows): try by externalId.
  const idMatch = slug.match(/-(\d+)$/)
  if (idMatch) {
    const externalId = parseInt(idMatch[1], 10)
    const byExternal = await prisma.job.findUnique({
      where: { source_externalId: { source: "JOB_ECO", externalId } },
      include: { company: true },
    })
    if (byExternal && byExternal.status === "PUBLISHED") {
      if (byExternal.slug !== slug) return { redirect: byExternal.slug }
      return { job: transformJob(byExternal) }
    }
  }

  // 4. Live fallback only for numeric-suffixed slugs (avoids random lookups).
  const fallbackId = idMatch ? parseInt(idMatch[1], 10) : null
  if (fallbackId != null) {
    try {
      const item = await fetchVacancy(fallbackId)
      const mapped = vacancyToJobFrontend(item)
      if (mapped.slug !== slug) return { redirect: mapped.slug }
      return { job: mapped as unknown as JobFrontend }
    } catch {
      return null
    }
  }

  return null
}
