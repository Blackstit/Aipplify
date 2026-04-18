import { Metadata } from "next"
import { getJobsWithFilters } from "@/lib/jobs"
import { JobsPageClient } from "./JobsPageClient"

export const dynamic = "force-dynamic"

const PER_PAGE = 10

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : ""
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const search = str(searchParams.search)

  let titleSuffix = ""
  if (search) titleSuffix += ` "${search}"`
  if (page > 1) titleSuffix += ` — Page ${page}`

  const title = `Web3 & Crypto Jobs${titleSuffix} | Aipplify`
  const description =
    page > 1
      ? `Browse Web3, crypto and blockchain job listings — page ${page}. Find remote and on-site positions at top companies.`
      : "Browse Web3, crypto and blockchain job listings. Find remote and on-site positions at top companies on Aipplify."

  return {
    title,
    description,
    alternates: {
      canonical: page <= 1 ? "/jobs" : `/jobs?page=${page}`,
    },
  }
}

export default async function JobsPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const search = str(searchParams.search)
  const sort = str(searchParams.sort) || "date_desc"

  let jobs: Awaited<ReturnType<typeof getJobsWithFilters>>["jobs"] = []
  let total = 0
  let totalPages = 1

  try {
    const data = await getJobsWithFilters({ page, limit: PER_PAGE, search, sort })
    jobs = data.jobs
    total = data.total
    totalPages = data.totalPages
  } catch (e) {
    console.error("Jobs page SSR error:", e)
  }

  const prevHref = page > 1 ? (page === 2 ? "/jobs" : `/jobs?page=${page - 1}`) : null
  const nextHref = page < totalPages ? `/jobs?page=${page + 1}` : null

  return (
    <>
      {prevHref && <link rel="prev" href={prevHref} />}
      {nextHref && <link rel="next" href={nextHref} />}
      <JobsPageClient
        initialJobs={jobs}
        initialPage={page}
        initialTotal={total}
        initialTotalPages={totalPages}
        initialSearch={search}
        initialSort={sort}
      />
    </>
  )
}
