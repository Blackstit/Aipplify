import { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { SavedJobsList } from "@/components/SavedJobsList"

export const metadata: Metadata = {
  title: "Saved Jobs - Aipplify",
  description: "View your saved job listings",
}

export default function SavedJobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-4xl font-bold mb-8">Saved Jobs</h1>
        <SavedJobsList />
      </div>
      <Footer />
    </div>
  )
}
