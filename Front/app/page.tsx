import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/SearchBar"
import { NeuralNetworkBackground } from "@/components/NeuralNetworkBackground"
import { Footer } from "@/components/Footer"
import { ArrowRight, Briefcase, Users, Zap, TrendingUp, Shield, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <NeuralNetworkBackground />
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Find Your Dream Job with
              <span className="block bg-gradient-primary bg-clip-text text-transparent mt-2">
                AI-Powered Matching
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the perfect opportunity tailored to your skills and experience. 
              Connect with top companies and accelerate your career.
            </p>
            <div className="flex justify-center">
              <SearchBar />
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/jobs">
                <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
                  Browse Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/for-recruiters">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Briefcase className="mr-2 h-4 w-4" />
                  For Recruiters
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/50 backdrop-blur-sm border-y border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5K+</div>
                <div className="text-sm text-gray-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-gray-600">Job Seekers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-gray-600">Match Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">Aipplify</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful AI-driven tools to help you find the perfect match
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes your skills and preferences to match you with the perfect job opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                <p className="text-gray-600">
                  Access exclusive opportunities from top companies and accelerate your career trajectory.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Companies</h3>
                <p className="text-gray-600">
                  Connect only with verified employers. Your safety and security are our top priorities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Filters</h3>
                <p className="text-gray-600">
                  Find exactly what you're looking for with our advanced filtering and search capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Connections</h3>
                <p className="text-gray-600">
                  Skip the middleman. Connect directly with recruiters and hiring managers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
                <p className="text-gray-600">
                  Apply to multiple positions with one click. Save time and focus on what matters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section for Recruiters */}
        <div className="bg-gradient-primary py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Are you a recruiter?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Post your vacancies and find the perfect candidates with our AI-powered platform
            </p>
            <Link href="/for-recruiters">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Job
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
