"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import type { JobFrontend } from "@/lib/jobs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<JobFrontend[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/recruiter/jobs?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId))
      }
    } catch (error) {
      console.error("Error deleting job:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
            <p className="text-gray-600">Manage your job postings</p>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven't created any jobs yet</p>
              <Link href="/recruiter/jobs/new">
                <Button className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/job/${job.slug}`}
                          className="text-xl font-semibold hover:text-primary transition-colors"
                        >
                          {job.title}
                        </Link>
                        <Badge variant={job.featured ? "default" : "outline"}>
                          {job.featured ? "Featured" : "Regular"}
                        </Badge>
                        <Badge variant={job.verified ? "default" : "outline"}>
                          {job.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{job.company.name}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.salary}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/job/${job.slug}`} className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/recruiter/jobs/${job.slug}/edit`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
