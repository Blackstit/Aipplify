import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCompanyBySlugFromDB, getJobsByCompanySlug } from "@/lib/jobs"
import { JobCard } from "@/components/JobCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
import { CompanyLogo } from "@/components/CompanyLogo"
import { ExternalLink } from "lucide-react"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlugFromDB(params.slug)
  
  if (!company) {
    return {
      title: "Company Not Found - Aipplify",
    }
  }

  return {
    title: `${company.name} - Aipplify`,
    description: company.description || `View all open positions at ${company.name}`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const company = await getCompanyBySlugFromDB(params.slug)

  if (!company) {
    notFound()
  }

  const jobs = await getJobsByCompanySlug(params.slug)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-6">
              <CompanyLogo 
                logo={company.logo || null} 
                name={company.name}
                size={120}
              />
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{company.name}</CardTitle>
                <p className="text-gray-600 mb-4">{company.description}</p>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      Visit Website
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center py-8">
                  No open positions at the moment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
