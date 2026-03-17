"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Building2 } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { CompanyLogo } from "@/components/CompanyLogo"

export default function RecruiterCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    if (!user?.id) return
    fetchCompanies()
  }, [user])

  const fetchCompanies = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/recruiter/companies?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Companies</h1>
            <p className="text-gray-600">Manage your companies</p>
          </div>
          <Link href="/recruiter/companies/new">
            <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't added any companies yet</p>
              <Link href="/recruiter/companies/new">
                <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <CompanyLogo logo={company.logo} name={company.name} size={64} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{company.name}</h3>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {company.jobsCount || 0} {company.jobsCount === 1 ? "job" : "jobs"}
                    </span>
                    <Link href={`/recruiter/companies/${company.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
