"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser } from "@/lib/session"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function CreateCompanyPage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    logoUrl: "",
  })

  useEffect(() => {
    if (!user?.id) {
      router.push("/auth")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const res = await fetch("/api/recruiter/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      })

      if (res.ok) {
        router.push("/recruiter/companies")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create company")
      }
    } catch (error) {
      console.error("Error creating company:", error)
      alert("Failed to create company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/recruiter/companies" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Link>

        <h1 className="text-3xl font-bold mb-8">Add Company</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Tech Corp"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Describe your company..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/recruiter/companies">
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
                  {loading ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      <Footer />
    </div>
  )
}
