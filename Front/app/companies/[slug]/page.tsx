import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  getCompanyBySlug,
  getCompanyJobs,
  getAllCompanies,
  getSimilarCompanies,
} from "@/lib/companies"
import { CompanyLogo } from "@/components/CompanyLogo"
import { Footer } from "@/components/Footer"
import { CompanyFAQ } from "./CompanyFAQ"
import {
  ArrowRight,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Building2,
  Star,
  ExternalLink,
  DollarSign,
  Heart,
  Laptop,
  GraduationCap,
  Shield,
  Sparkles,
} from "lucide-react"

type Props = { params: { slug: string } }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug)
  if (!company) return { title: "Company Not Found — Aipplify" }

  return {
    title: `${company.name} Careers & Jobs | AI-Scored Open Positions | Aipplify`,
    description: `Find ${company.name} jobs in crypto, blockchain, and engineering. Apply to ${company.jobCount} verified positions with AI quality scores. Remote & onsite.`,
    alternates: { canonical: `/companies/${params.slug}` },
    openGraph: {
      title: `${company.name} Careers & Jobs | Aipplify`,
      description: `Apply to ${company.jobCount} verified positions at ${company.name}.`,
      url: `https://aipplify.com/companies/${params.slug}`,
    },
  }
}

function scoreColor(s: number) {
  if (s >= 8) return "text-emerald-600 bg-emerald-50"
  if (s >= 6) return "text-amber-600 bg-amber-50"
  return "text-gray-600 bg-gray-50"
}

export default async function CompanyPage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug)
  if (!company) notFound()

  const { jobs } = await getCompanyJobs(company.name)
  const allCompanies = await getAllCompanies()
  const similar = getSimilarCompanies(allCompanies, params.slug, 6)

  const companySchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: `https://aipplify.com/companies/${params.slug}`,
    ...(company.logo && { logo: company.logo }),
    ...(company.summary && { description: company.summary }),
    ...(company.headquarters && {
      address: {
        "@type": "PostalAddress",
        addressLocality: company.headquarters,
      },
    }),
    ...(company.size && {
      numberOfEmployees: { "@type": "QuantitativeValue", value: company.size },
    }),
    ...(company.industry && { industry: company.industry }),
    ...(company.website && { sameAs: [company.website] }),
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companySchema) }}
      />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <CompanyLogo
              logo={company.logo}
              name={company.name}
              size={96}
              className="rounded-2xl shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                {company.name} Jobs &amp; Careers
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mb-5">
                {company.headquarters && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {company.headquarters}
                  </span>
                )}
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {company.industry}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    {company.size}
                  </span>
                )}
                {company.founded && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-gray-400" />
                    Founded {company.founded}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#open-positions"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  <Briefcase className="h-4 w-4" />
                  Browse {company.jobCount} open positions
                </a>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* About */}
        {company.summary && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About {company.name}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 leading-relaxed">
              <p>{company.summary}</p>
              {company.domains && company.domains.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {company.domains.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Benefits */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Work at {company.name}?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: DollarSign,
                title: "Competitive Compensation",
                text: "Salary + equity/token packages aligned with market benchmarks",
              },
              {
                icon: Heart,
                title: "Health & Wellness",
                text: "Comprehensive health, dental, and vision coverage",
              },
              {
                icon: Laptop,
                title: "Remote-Friendly Culture",
                text: "Flexible work arrangements with global team collaboration",
              },
              {
                icon: GraduationCap,
                title: "Learning & Growth",
                text: "Professional development budget and conference sponsorship",
              },
              {
                icon: Shield,
                title: "Work-Life Balance",
                text: "Generous PTO, paid parental leave, and mental health support",
              },
              {
                icon: Sparkles,
                title: "Cutting-Edge Tech",
                text: "Work on innovative projects at the forefront of AI and Web3",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Current Open Positions at {company.name}
          </h2>
          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span>{job.location}</span>
                        {job.salary !== "Not specified" && (
                          <span className="font-medium text-gray-700">
                            {job.salary}
                          </span>
                        )}
                        <span className="capitalize">{job.experience}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {job.aiScore != null && !isNaN(job.aiScore) && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${scoreColor(job.aiScore)}`}
                        >
                          <Sparkles className="h-3 w-3" />
                          {job.aiScore.toFixed(1)}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No open positions at the moment</p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline"
              >
                Browse all jobs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions about {company.name} Careers
          </h2>
          <CompanyFAQ companyName={company.name} />
        </section>

        {/* Similar Companies */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Similar Companies Hiring
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {similar.map((c) => (
                <Link
                  key={c.slug}
                  href={`/companies/${c.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm hover:border-primary/30 transition-all group"
                >
                  <CompanyLogo
                    logo={c.logo}
                    name={c.name}
                    size={40}
                    className="rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.jobCount} open positions
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
