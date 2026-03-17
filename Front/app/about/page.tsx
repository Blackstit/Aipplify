import { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Target, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Aipplify",
  description: "Learn about Aipplify and our mission to connect talent with opportunities",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Aipplify</h1>
          <p className="text-xl text-gray-600">
            Connecting talented professionals with top companies worldwide
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Aipplify is an AI-powered job board designed to revolutionize how people find their dream jobs and how companies discover exceptional talent. We leverage cutting-edge artificial intelligence to match candidates with opportunities that align perfectly with their skills, experience, and career aspirations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our platform eliminates the noise and inefficiencies of traditional job searching, providing a streamlined, intelligent experience for both job seekers and employers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">What Makes Us Different</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Matching</h3>
                  <p className="text-sm text-gray-600">
                    Advanced algorithms analyze your profile and match you with the most relevant opportunities
                  </p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Quality Over Quantity</h3>
                  <p className="text-sm text-gray-600">
                    We focus on curated, high-quality job listings from verified companies
                  </p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Fast & Efficient</h3>
                  <p className="text-sm text-gray-600">
                    Get instant notifications and apply to jobs in seconds with our streamlined process
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">For Employers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Aipplify helps companies find the right talent faster. Our AI screening and matching system ensures you receive applications from candidates who truly fit your requirements, saving time and resources in the hiring process.
              </p>
              <p className="text-gray-700 leading-relaxed">
                With features like featured job postings, verified company status, and direct candidate contact, we provide everything you need to build your dream team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Join Us</h2>
              <p className="text-gray-700 leading-relaxed">
                Whether you're looking for your next career opportunity or seeking exceptional talent, Aipplify is here to help. Join thousands of professionals and companies who have already discovered the future of job searching.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
