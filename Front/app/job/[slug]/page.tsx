import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Tag } from "@/components/Tag"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/Footer"
import { CompanyLogo } from "@/components/CompanyLogo"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { MapPin, Clock, Bookmark, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { JobViewTracker } from "@/components/JobViewTracker"
import { JobDescription } from "@/components/JobDescription"
import { ApplyButton } from "@/components/ApplyButton"
import { SimilarJobs } from "@/components/SimilarJobs"
import { SaveJobButton } from "@/components/SaveJobButton"
import { CompanyJobsButton } from "@/components/CompanyJobsButton"

type Props = {
  params: { slug: string }
}

async function getJob(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/jobs/${slug}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob(params.slug)
  
  if (!job) {
    return {
      title: "Job Not Found - Aipplify",
    }
  }

  return {
    title: `${job.title} at ${job.company.name} - Aipplify`,
    description: job.description,
  }
}

export default async function JobPage({ params }: Props) {
  const job = await getJob(params.slug)

  if (!job) {
    notFound()
  }

  const postedTime = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })

  return (
    <div className="min-h-screen bg-background">
      <JobViewTracker jobSlug={job.slug} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <CompanyLogo 
                    logo={job.company.logo} 
                    name={job.company.name}
                    size={80}
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/company/${job.company.slug}`}
                        className="text-xl text-primary hover:underline"
                      >
                        {job.company.name}
                      </Link>
                      {job.featured && (
                        <VerifiedBadge type="featured" />
                      )}
                      {!job.featured && job.company.verified && (
                        <VerifiedBadge type="verified" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {job.salary}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{postedTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <JobDescription description={job.description} />
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <ApplyButton 
                  jobId={job.id} 
                  jobSlug={job.slug} 
                  jobTitle={job.title}
                  recruiterContact={job.recruiterContact}
                />
                <SaveJobButton jobId={job.id} jobSlug={job.slug} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo 
                    logo={job.company.logo} 
                    name={job.company.name}
                    size={48}
                  />
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/company/${job.company.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {job.company.name}
                    </Link>
                    {job.featured && (
                      <VerifiedBadge type="featured" />
                    )}
                    {!job.featured && job.company.verified && (
                      <VerifiedBadge type="verified" />
                    )}
                  </div>
                </div>
                <CompanyJobsButton 
                  companySlug={job.company.slug}
                  companyName={job.company.name}
                />
              </CardContent>
            </Card>

          </aside>
        </div>

        {/* Similar Jobs Section */}
        <SimilarJobs jobSlug={job.slug} />
      </div>
      <Footer />
    </div>
  )
}
