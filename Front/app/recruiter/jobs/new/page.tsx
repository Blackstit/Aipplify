"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getCurrentUser } from "@/lib/session"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function CreateJobPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salaryText: "",
    salaryMin: "",
    salaryMax: "",
    currency: "",
    locationText: "",
    workType: "remote",
    experience: "mid",
    tags: [] as string[],
    companyId: "",
    recruiterContact: "",
    status: "draft",
  })

  useEffect(() => {
    if (!user?.id) {
      router.push("/auth")
      return
    }
    fetchCompanies()
  }, [user])

  const fetchCompanies = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/recruiter/companies?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies || [])
        if (data.companies?.length > 0) {
          setFormData((prev) => ({ ...prev, companyId: data.companies[0].id }))
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const res = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          tags: formData.tags.filter(Boolean),
          featured: false, // Only available with premium subscription
          verified: false, // Only available with premium subscription
        }),
      })

      if (res.ok) {
        const job = await res.json()
        router.push(`/recruiter/jobs`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create job")
      }
    } catch (error) {
      console.error("Error creating job:", error)
      alert("Failed to create job")
    } finally {
      setLoading(false)
    }
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = e.currentTarget.value.trim()
      if (value && !formData.tags.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, value],
        }))
        e.currentTarget.value = ""
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/recruiter/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>

        <h1 className="text-3xl font-bold mb-8">Create New Job</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={8}
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    placeholder="List specific requirements..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Company & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Link href="/recruiter/companies/new" className="text-sm text-primary hover:underline mt-2 inline-block">
                    + Create new company
                  </Link>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.locationText}
                    onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                    required
                    placeholder="e.g. Remote, New York, USA"
                  />
                </div>

                <div>
                  <Label htmlFor="workType">Work Type *</Label>
                  <Select
                    value={formData.workType}
                    onValueChange={(value) => setFormData({ ...formData, workType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Salary & Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Salary & Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="RUB">RUB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => setFormData({ ...formData, experience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intern">Intern</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Middle</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="salaryText">Salary Text (Alternative)</Label>
                  <Input
                    id="salaryText"
                    value={formData.salaryText}
                    onChange={(e) => setFormData({ ...formData, salaryText: e.target.value })}
                    placeholder="e.g. $100k - $150k"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags & Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Tags & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    onKeyDown={handleTagInput}
                    placeholder="Press Enter to add tag"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700 flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter((_, i) => i !== index),
                            })
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="recruiterContact">Recruiter Contact</Label>
                  <Input
                    id="recruiterContact"
                    value={formData.recruiterContact}
                    onChange={(e) => setFormData({ ...formData, recruiterContact: e.target.value })}
                    placeholder="Telegram, Email, or Phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Featured and Verified badges are available with premium subscription plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/recruiter/jobs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
