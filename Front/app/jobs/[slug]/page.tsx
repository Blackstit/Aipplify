import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { resolveVacancyBySlug } from "@/lib/resolve-job"
import { Footer } from "@/components/Footer"
import { CompanyLogo } from "@/components/CompanyLogo"
import { Tag } from "@/components/Tag"
import { SimilarJobs } from "@/components/SimilarJobs"
import { JobDescription } from "@/components/JobDescription"
import { JobInteractions } from "./JobInteractions"
import { JobDetailLiveMetrics } from "@/components/JobDetailLiveMetrics"
import { getSiteSettings } from "@/lib/site-settings"
import {
  MapPin, Clock, Briefcase, DollarSign,
  Globe, Award, ChevronRight, Star, AlertTriangle,
  Building, Sparkles, ExternalLink,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

type Props = { params: { slug: string } }

async function getJob(slug: string) {
  try {
    const result = await resolveVacancyBySlug(slug)
    return result
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getJob(params.slug)
  if (!result || "redirect" in result) {
    return { title: "Job Not Found — Aipplify" }
  }
  const job = result.job
  const desc = job.description
    ? job.description.replace(/[#*\n]+/g, " ").slice(0, 155).trim() + "..."
    : `Apply to ${job.title} at ${job.company.name}. AI-scored position on Aipplify.`

  return {
    title: `${job.title} at ${job.company.name} | Aipplify`,
    description: desc,
    alternates: { canonical: `/jobs/${params.slug}` },
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: desc,
      url: `https://aipplify.com/jobs/${params.slug}`,
      type: "website",
    },
  }
}

function ScoreBar({ label, score, summary }: { label: string; score: number; summary: string }) {
  const pct = Math.min(100, (score / 10) * 100)
  const color = score >= 8 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-rose-500"
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-0.5 ml-0.5">{summary}</p>
    </div>
  )
}

export default async function JobDetailPage({ params }: Props) {
  const result = await getJob(params.slug)
  const site = await getSiteSettings()

  if (!result) notFound()

  if ("redirect" in result) {
    redirect(`/jobs/${result.redirect}`)
  }

  const job = result.job
  const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
  const scoring = job.scoring
  const aiSummary = scoring?.overall_summary

  const isRemote = job.workType === "remote"
  const locationRaw = (job as any).countryCity || job.companyInfo?.headquarters || null
  const locationName = locationRaw || (isRemote ? "Remote" : "Worldwide")

  function buildJobLocation() {
    if (locationRaw) {
      const parts = locationRaw.split(",").map((s: string) => s.trim())
      return {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          ...(parts.length >= 3 && { addressLocality: parts[0], addressRegion: parts[1], addressCountry: parts[2] }),
          ...(parts.length === 2 && { addressLocality: parts[0], addressCountry: parts[1] }),
          ...(parts.length === 1 && { addressCountry: parts[0] }),
        },
      }
    }
    return {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "US" },
    }
  }

  function buildApplicantLocationRequirements() {
    if (!isRemote) return undefined
    if (locationRaw) {
      const parts = locationRaw.split(",").map((s: string) => s.trim())
      const country = parts[parts.length - 1]
      if (country && country.length <= 3) {
        return [{ "@type": "Country", name: country }]
      }
      return [{ "@type": "Country", name: country }]
    }
    return [{ "@type": "Country", name: "US" }, { "@type": "Country", name: "GB" }, { "@type": "Country", name: "DE" }]
  }

  const jobPostingSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description?.slice(0, 5000),
    datePosted: job.postedAt,
    validThrough: new Date(new Date(job.postedAt).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      ...(job.companyInfo?.logo_url && { logo: job.companyInfo.logo_url }),
      ...(job.companyInfo?.website && { sameAs: job.companyInfo.website }),
    },
    jobLocation: buildJobLocation(),
    ...(isRemote && { jobLocationType: "TELECOMMUTE" }),
    ...(isRemote && { applicantLocationRequirements: buildApplicantLocationRequirements() }),
    employmentType: "FULL_TIME",
    ...(job.salaryMin != null && job.salaryMax != null && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.currency || "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: "YEAR",
        },
      },
    }),
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/jobs" className="hover:text-primary">Jobs</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 truncate max-w-xs">{job.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <CompanyLogo logo={job.company.logo} name={job.company.name} size={80} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                    {job.aiScore != null && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="text-lg font-bold">{job.aiScore.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-primary mt-1">{job.company.name}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="capitalize">{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{postedTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.tags.slice(0, 12).map((tag: string) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <JobDetailLiveMetrics
                    slug={params.slug}
                    initialViews={job.viewCount ?? 0}
                    allowPublicCounts={site.showPublicJobViewCounts}
                    allowPublicWatching={site.showPublicWatchingCount}
                  />
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">AI Summary</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{aiSummary}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <JobDescription description={job.description} />
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && job.requirements[0] && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <JobDescription description={job.requirements.join("\n\n")} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <JobInteractions
                jobId={job.id}
                jobSlug={job.slug}
                jobTitle={job.title}
                company={job.company}
                salary={job.salary}
                location={job.location}
                experience={job.experience}
                tags={job.tags}
                postedAt={job.postedAt}
                recruiterContact={job.recruiterContact}
              />
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-gray-400" />
                Company Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo logo={job.companyInfo?.logo_url || job.company.logo} name={job.company.name} size={48} />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{job.company.name}</p>
                    {job.companyInfo?.industry && (
                      <p className="text-sm text-gray-500">{job.companyInfo.industry}</p>
                    )}
                  </div>
                </div>

                {job.companyInfo?.summary && (
                  <p className="text-sm text-gray-600 leading-relaxed">{job.companyInfo.summary}</p>
                )}

                <div className="space-y-2 text-sm">
                  {job.companyInfo?.headquarters && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{job.companyInfo.headquarters}</span>
                    </div>
                  )}
                  {job.companyInfo?.size && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{job.companyInfo.size} employees</span>
                    </div>
                  )}
                  {job.companyInfo?.founded && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>Founded {job.companyInfo.founded}</span>
                    </div>
                  )}
                </div>

                {job.companyInfo?.website && (
                  <a
                    href={job.companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}

                {job.companyInfo?.socials && Object.keys(job.companyInfo.socials).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {Object.entries(job.companyInfo.socials).map(([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full transition-colors capitalize"
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Quality Score */}
            {scoring && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  AI Quality Score
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-4xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {scoring.total_score.toFixed(1)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">out of 10</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {scoring.scoring_results.map((r) => (
                      <ScoreBar key={r.key} label={r.criterion} score={r.score} summary={r.summary} />
                    ))}
                  </div>

                  {scoring.red_flags.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span className="text-sm font-semibold text-rose-800">Red Flags</span>
                      </div>
                      <ul className="text-sm text-rose-700 space-y-1">
                        {scoring.red_flags.map((f, i) => (
                          <li key={i}>&bull; {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>

        <SimilarJobs jobSlug={job.slug} />
      </div>
      <Footer />
    </div>
  )
}
